const { Command, utils } = require("discord-bot");
const { maxDice, roll, generateReply } = require("../utils/dice");

module.exports = new Command("roll", function (message, args) {
    let query = args.slice(1).join("") || "d20", result;
    if (result = roll(query)) {
        utils.sendVerbose(message.channel, generateReply(message.author, result))
            .catch(console.error);
    }
    else {
        utils.sendVerbose(message.channel, `${message.author}\n\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.error);
    }
}, {
    usage: "@kennybot roll [die count]d<sides>[modifiers]",
    description: "Rolls dice. Defaults to a d20 if nothing is specified",
    subtitle: `Max dice count is ${maxDice}`,
    aliases: ["r", "rolll", "rol", "d20", "1d20"]
});
