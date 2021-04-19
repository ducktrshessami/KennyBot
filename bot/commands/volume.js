const { Command, utils } = require("discord-bot");
const { changeVolume } = require("../../utils/music");

module.exports = new Command("volume", function (message, args) {
    let vol = Number(args[1]);
    if (vol || vol === 0) {
        changeVolume(message.guild.id, vol)
            .then(() => utils.sendVerbose(message.channel, `Volume updated to \`${vol}\``))
            .catch(console.error);
    }
    else {
        utils.sendVerbose(message.channel, `${message.author}\n\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.error);
    }
}, {
    aliases: ["vol"],
    usage: "@kennybot volume <value>",
    description: "Change the volume of the music player",
    subtitle: "Value is truncated to range from `0` to `1.5`"
});
