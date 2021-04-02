const DiscordBot = require("discord-bot");
const config = require("../config/bot.json");
const commands = require("./commands");

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

config.token = process.env.BOT_TOKEN || config.token;
client = new DiscordBot(config, commands);

client.on("ready", function () {
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);
});

client.on("shardDisconnect", function () {
    console.log("Logged off");
    process.exit();
});

client.on("error", console.error);

module.exports = client;
