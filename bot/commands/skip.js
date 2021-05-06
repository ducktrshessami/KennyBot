const { Command, utils } = require("discord-bot");
const { skip } = require("../../utils/music");
const { getNewState } = require("../../utils/state");

module.exports = new Command("skip", function (message) {
    skip(message.guild.id)
        .then(res => {
            if (res) {
                return getNewState(message.guild.id)
                    .then(state => utils.sendVerbose(message.channel, `Now playing: \`${state.song.title}\``));
            }
        })
        .catch(console.error);
}, {
    usage: "@kennybot skip",
    description: "Skip the currently playing song"
});
