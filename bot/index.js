const DiscordBot = require("discord-bot");
const db = require("../models");
const config = require("../config/bot.json");
const commands = require("./commands");
const responses = require("./responses");
const helpCmd = require("./helpCmd");
const initGuild = require("./utils/initGuild");
const { emitStateUpdate } = require("../utils/state");

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
client = new DiscordBot(config, commands, responses);

// Event handlers
client.on("ready", function () {
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);
    client.guilds.cache.each(initGuild);
});

client.on("shardDisconnect", function () {
    console.log("Logged off");
    process.exit();
});

client.on("error", console.error);

client.on("guildCreate", initGuild);

client.on("guildUpdate", (before, after) => initGuild(after));

client.on("voiceStateUpdate", async (before, after) => {
    if (after.member.id === client.user.id) {
        if (!after.channel) {
            let guild = await db.Guild.findByPk(after.guild.id, { include: db.State });
            await guild.State.update({
                playing: false,
                paused: false,
                lastNotQueue: null
            });
        }
        emitStateUpdate(after.guild.id)
            .catch(console.error);
    }
});

module.exports = client;
