const DiscordBot = require("discord-bot");
const config = require("../config/bot.json");
const commands = require("./commands");
const helpCmd = require("./helpCmd");
const initGuild = require("./utils/initGuild");

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
commands.push(helpCmd(commands));

config.token = process.env.BOT_TOKEN || config.token;
client = new DiscordBot(config, commands);

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

module.exports = client;
