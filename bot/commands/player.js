const { Command, utils } = require("discord-bot");

module.exports = new Command("player", function (message, args) {
    utils.sendVerbose(message.channel, process.env.CLIENT_ORIGIN)
        .catch(console.error);
}, {
    usage: "@kennybot player",
    description: "Links the music player website",
    aliases: ["site", "link", "playlist", "list"]
});
