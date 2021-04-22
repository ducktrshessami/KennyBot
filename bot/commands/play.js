const { Command, utils } = require("discord-bot");
const { getBasicInfo } = require("ytdl-core");
const { getInfo } = require("scdl-core");
const { getSource } = require("../../utils/audio");
const { playUrl } = require("../../utils/music");

module.exports = new Command("play", function (message, args) {
    let source = getSource(args[1]);
    if (args.length > 1 && source) {
        let getter;
        switch (source) {
            case "youtube": getter = getBasicInfo(args[1])
                .then(res => res.videoDetails.title);
                break;
            case "soundcloud": getter = getInfo(args[1])
                .then(res => `${res.user.username} - ${res.title}`);
                break;
            default:
        }
        Promise.all([
            getter,
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
            });
    }
});
