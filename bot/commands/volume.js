const { Command, utils } = require("discord-bot");
const { changeVolume } = require("../../utils/music");
const { getNewState } = require("../../utils/state");

module.exports = new Command("volume", function (message, args) {
    let vol = Number(args[1]);
    if (vol || vol === 0) {
        changeVolume(message.guild.id, vol)
            .then(() => utils.sendVerbose(message.channel, `Volume updated to \`${vol}\``))
            .catch(console.error);
    }
    else {
        if (args[1]) {
            utils.sendVerbose(message.channel, `${message.author}\n\`${this.usage}\`\n${this.subtitle}`)
                .catch(console.error);
        }
        else {
            getNewState(message.guild.id)
                .then(({ volume }) => utils.sendVerbose(message.channel, `Current volume: \`${volume}\``));
        }
    }
}, {
    aliases: ["vol"],
    usage: "@kennybot volume [value]",
    description: "Display or change the volume of the music player",
    subtitle: "Value is truncated to range from `0` to `1.5`"
});
