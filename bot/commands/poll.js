const { Command, utils } = require("discord-bot");

module.exports = new Command("poll", function (message) {
    let emoji = message.content.match(/[^\u0000-\u007F]+|<:[_a-z0-9]+:[0-9]+>|<a:[_a-z0-9]+:[0-9]+>/gi);
    message.pin()
        .catch(console.error);
}, {
    usage: "@kennybot [emojis]",
    description: `Automatically reacts to and pins a message to set up a poll. After ${config.pollDuration} minutes (${(config.pollDuration / 60)} hours), results are posted in the same channel`,
    subtitle: "Uses every emoji in the message."
});
