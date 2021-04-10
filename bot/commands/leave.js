const { Command, utils } = require("discord-bot");

module.exports = new Command("leave", function (message) {
    if (message.guild.voice.connection) {
        message.guild.voice.connection.disconnect();
        utils.sendVerbose(message.channel, "Disconnected")
            .catch(console.error);
    }
    else {
        utils.sendVerbose(message.channel, `${message.author} No`)
            .catch(console.error);
    }
}, {
    usage: "@kennybot leave",
    description: "Disconnects from this server's voice channels"
});
