const DiscordBot = require("discord-bot");
const db = require("../models");
const config = require("../config/bot.json");
const commands = require("./commands");
const responses = require("./responses");
const activities = require("./activities");
const helpCmd = require("./helpCmd");
const initGuild = require("./utils/initGuild");
const { emitStateUpdate } = require("../utils/state");
const { clearQueue } = require("../utils/music");
const { prune } = require("../utils/audit");

var client;

try {
    let parsedAdmins = JSON.parse(process.env.BOT_ADMINS);
    if (parsedAdmins) {
        config.admin = parsedAdmins;
    }
}
catch {
    console.warn("Could not parse env BOT_ADMINS as JSON");
}

// Special tailored help command
helpCmd(commands);

config.token = process.env.BOT_TOKEN || config.token;
config.options = {
    ws: { intents: [DiscordBot.Discord.Intents.NON_PRIVILEGED, "GUILD_MEMBERS"] }
};
client = new DiscordBot(config, commands, responses);

// Event handlers
client.on("ready", function () {
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);
    client.loopPresences(activities, process.env.BOT_PRESDURATION || config.presenceDuration);
    client.guilds.cache.each(initGuild);
    prune()
        .catch(console.error);
});

client.on("shardDisconnect", function (event) {
    console.log(event.reason);
    console.log("Logged off");
    process.exit(event.code === 1000 ? 0 : event.code);
});

client.on("error", console.error);

client.on("guildCreate", initGuild);

client.on("guildUpdate", (before, after) => initGuild(after));

client.on("voiceStateUpdate", (before, after) => {
    if (!after.channel && after.member.id === client.user.id) {
        db.Guild.findByPk(after.guild.id, { include: db.State })
            .then(guild => Promise.all([
                guild.State.update({
                    playing: false,
                    paused: false,
                    lastNotQueue: null,
                    SongId: null
                }),
                clearQueue(after.guild.id)
            ]))
            .then(() => emitStateUpdate(after.guild.id))
            .catch(console.error);
    }
    else if (after.member.id === client.user.id) {
        emitStateUpdate(after.guild.id)
            .catch(console.error);
    }
});

module.exports = client;
