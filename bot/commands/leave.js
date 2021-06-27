const { Command, utils } = require("discord-bot");
const sendAudit = require("../utils/sendAudit");

module.exports = new Command("leave", function (message) {
    if (message.guild.voice.connection) {
        let channelID = message.guild.voice.channelID;
        message.guild.voice.connection.disconnect();
        utils.sendVerbose(message.channel, "Disconnected")
            .then(() => sendAudit(message.guild.id, message.author, `disconnected the bot from <#${channelID}>`))
            .catch(console.error);
    }
    else {
        utils.sendVerbose(message.channel, `${message.author} No`)
            .catch(console.error);
    }
}, {
    usage: "@kennybot leave",
    description: "Disconnects from this server's voice channels",
    aliases: ["stop"]
});
