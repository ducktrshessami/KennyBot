const { Command, utils } = require("discord-bot");
const db = require("../../models");

module.exports = new Command("volume", function (message, args) {
    let vol = Number(args[1]);
    if (vol || vol === 0) {
        vol = Math.max(0, Math.min(1.5, vol));
        db.Guild.findByPk(message.guild.id)
            .then(guild => guild.update({ volume: vol }))
            .then(() => utils.sendVerbose(message.channel, `Volume updated to \`${vol}\``))
            .catch(console.error);
    }
    else {
        utils.sendVerbose(message.channel, `${message.author}\n\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.error);
    }
}, {
    aliases: ["vol"]
});
