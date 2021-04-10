const { Command, utils } = require("discord-bot");
const { maxDice, disadvantage, generateReply } = require("../utils/diceHandler");

module.exports = new Command("disadvantage", function (message, args) {
    let query = args.slice(1).join("") || "d20", results;
    if (results = disadvantage(query)) {
        utils.sendVerbose(message.channel, generateReply(message.author, results[0], results[1].value))
            .catch(console.error);
    }
    else {
        utils.sendVerbose(message.channel, `${message.author}\n\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.error);
    }
}, {
    usage: "@kennybot disadvantage [die count]d<sides>[modifiers]",
    description: "Rolls dice with disadvantage. Defaults to a d20 if nothing is specified",
    subtitle: `Max dice count is ${maxDice}`,
    aliases: ["disadv", "disad"]
});
