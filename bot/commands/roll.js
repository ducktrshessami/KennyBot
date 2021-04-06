const { Command, utils } = require("discord-bot");
const { maxDice, roll, generateReply } = require("../utils/diceHandler");

module.exports = new Command("roll", function (message, args) {
    let query = "d20", result;
    if (args.length > 1) {
        args.shift();
        query = args.join("");
    }
    if (result = roll(query)) {
        utils.sendVerbose(message.channel, generateReply(message.author.id, result))
            .catch(console.log);
    }
    else {
        utils.sendVerbose(message.channel, `\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.log);
    }
}, {
    usage: "@kennybot roll [die count]d<sides>[modifiers]",
    description: "Rolls dice. Defaults to a d20 if nothing is specified",
    subtitle: `Max dice count is ${maxDice}`,
    aliases: ["r", "rolll", "rol", "d20", "1d20"]
});
