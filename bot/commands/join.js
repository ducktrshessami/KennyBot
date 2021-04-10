const { Command, utils } = require("discord-bot");

module.exports = new Command("join", function (message) {
    if (message.member.voice.channel && !message.member.voice.channel.members.has(client.user.id)) {
        message.member.voice.channel.join()
            .then(connection => utils.sendVerbose(message.channel, `Connected to \`${connection.channel.name}\``))
            .catch(console.error);
    }
    else {
        utils.sendVerbose(message.channel, `${message.author} No`)
            .catch(console.error);
    }
}, {
    usage: "@kennybot join",
    description: "Joins the user's voice channel"
});
