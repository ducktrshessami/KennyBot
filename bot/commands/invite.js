const { Command, utils } = require("discord-bot");
const { inviteUrl } = require("../../utils/discord");

module.exports = new Command("invite", function (message) {
    utils.sendVerbose(message.channel, `${message.author} ${inviteUrl}`)
        .catch(console.error);
}, {
    admin: true,
    usage: "@kennybot invite",
    description: "Send a link to invite KennyBot to a server",
    aliases: ["inv"]
});
