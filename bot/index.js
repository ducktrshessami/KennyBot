const DiscordBot = require("discord-bot");
const db = require("../models");
const config = require("../config/bot.json");
const commands = require("./commands");
const responses = require("./responses");
const activities = require("./activities");
const helpCmd = require("./helpCmd");
const initGuild = require("./utils/initGuild");
const handleIdle = require("./utils/handleIdle");
const { emitStateUpdate } = require("../utils/state");
const { clearQueue } = require("../utils/music");
const { prune } = require("../utils/audit");

var client;

try {
    let parsedAdmins = JSON.parse(process.env.BOT_ADMINS);
    if (parsedAdmins) {
        config.admin = (config.admin || []).concat(parsedAdmins);
    }
}
catch {
    console.warn("Could not parse env BOT_ADMINS as JSON");
}

// Special tailored help command
helpCmd(commands);

config.token = process.env.BOT_TOKEN || config.token;
config.options = {
    ws: { intents: [DiscordBot.Discord.Intents.NON_PRIVILEGED, "GUILD_MEMBERS"] } // GUILD_MEMBERS intent for audit log member filter
};
client = new DiscordBot(config, commands, responses);

// Event handlers
client.on("ready", function () {
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);
    client.loopPresences(activities, process.env.BOT_PRESDURATION || config.presenceDuration);
    client.guilds.cache.each(initGuild); // Initialize guilds in database

    // Old audit log pruning
    setInterval(() => prune().catch(console.error), Number(process.env.AUDIT_CHECK) || 86400000);
    prune()
        .catch(console.error);
});

client.on("shardDisconnect", function (event) {
    if (event.reason) {
        console.log(event.reason);
    }
    console.log("Logged off");
    process.exit(event.code === 1000 ? 0 : event.code);
});

client.on("error", console.error);

client.on("guildCreate", initGuild);

client.on("guildUpdate", (before, after) => initGuild(after));

// Handle bot leaving voice channel
client.on("voiceStateUpdate", (before, after) => {
    handleVoiceDisconnect(after);
    handleIdle(before, after);
});

async function handleVoiceDisconnect(voiceState) {
    if (!voiceState.channel && voiceState.member.id === client.user.id) {
        db.Guild.findByPk(voiceState.guild.id, { include: db.State })
            .then(guild => Promise.all([
                guild.State.update({
                    playing: false,
                    paused: false,
                    lastNotQueue: null,
                    SongId: null
                }),
                clearQueue(voiceState.guild.id)
            ]))
            .then(() => emitStateUpdate(voiceState.guild.id))
            .catch(console.error);
    }
    else if (voiceState.member.id === client.user.id) {
        emitStateUpdate(voiceState.guild.id)
            .catch(console.error);
    }
}

// Clean up voice connections before exiting
process.on("exit", () => {
    client.voice.connections.each(connection => connection.disconnect());
});

module.exports = client;
