const { Command, utils } = require("discord-bot");
const config = require("../../config/bot.json");

module.exports = new Command("poll", function (message) {
    let emojis = message.content.match(/[^\u0000-\u007F]+|<:[_a-z0-9]+:[0-9]+>|<a:[_a-z0-9]+:[0-9]+>/gi);
    if (emojis) {
        let results = [];
        for (let i = 0; i < emojis.length; i++) {
            results.push({
                emoji: emojis[i],
                votes: 0
            });
        }
        utils.reactButtons(message, emojis.map((emoji, i) => ({
            emoji,
            callback: (reaction, user, add) => results[i].votes += add ? 1 : -1
        })), config.cmdOptions.poll.duration, config.cmdOptions.poll.duration)
            .then(() => {
                if (!message.deleted) {
                    let response = `${message.author}\nhttp://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id}\n>>> ${message.cleanContent}`;
                    let top = results.sort((a, b) => b.votes - a.votes)
                        .filter(result => result.votes === results[0].votes);
                    if (top.length === 1) {
                        response += `\n${top[0].emoji} won with \`${top[0].votes}\` ${top[0].votes === 1 ? "vote" : "votes"}`;
                    }
                    else {
                        response += `${top.map(result => result.emoji).join(' ')} tied with \`${top[0].votes}\` ${top[0].votes === 1 ? "vote" : "votes"}`;
                    }
                    return utils.sendVerbose(message.channel, response);
                }
            })
            .catch(console.error);
        message.pin()
            .catch(console.error);
    }
}, {
    usage: "@kennybot [emojis]",
    description: `Automatically reacts to and pins a message to set up a poll. After ${config.cmdOptions.poll.duration / 60000} minutes (${config.cmdOptions.poll.duration / 3600000} hours), results are posted in the same channel`,
    subtitle: "Uses every emoji in the message."
});
