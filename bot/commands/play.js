const { Command, utils } = require("discord-bot");
const { getSource, getTitle } = require("../../utils/audio");
const { playUrl } = require("../../utils/music");

module.exports = new Command("play", function (message, args) {
    let source = getSource(args[1]);
    if (args.length > 1 && source) {
        Promise.all([
            getTitle(args[1]),
            playUrl(message.guild.id, args[1])
        ])
            .then(([title, success]) => {
                if (success) {
                    utils.sendVerbose(message.channel, `Playing \`${title}\``)
                        .catch(console.error);
                }
                else {
                    utils.sendVerbose(message.channel, `Failed to play \`${args[1]}\``)
                        .catch(console.error);
                }
            })
            .catch(console.error);
    }
}, {
    usage: "@kennybot play <url>",
    description: "Play a single song from URL"
});
