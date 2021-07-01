const { Command, utils } = require("discord-bot");

module.exports = new Command("invite", function (message, args) {
    utils.sendVerbose(message.channel, `https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=3501120&scope=bot%20applications.commands`)
        .catch(console.error);
}, {
    usage: "@kennybot invite",
    description: "Sends the bot invite link"
});
