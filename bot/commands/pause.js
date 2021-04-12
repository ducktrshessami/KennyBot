const { Command } = require("discord-bot");
const { pause } = require("../../utils/music");

module.exports = new Command("pause", function (message) {
    if (pause(message.guild.id)) {
        message.react("<:kenny:692173906433277984>")
            .catch(console.error);
    }
}, {
    usage: "@kennybot pause",
    description: "Pause the music"
});
