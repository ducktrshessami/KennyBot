const { Command } = require("discord-bot");
const { resume } = require("../../utils/music");

module.exports = new Command("resume", function (message) {
    if (resume(message.guild.id)) {
        message.react("<:kenny:692173906433277984>")
            .catch(console.error);
    }
}, {
    usage: "@kennybot resume",
    description: "Resume the playback",
    aliases: ["unpause"]
});
