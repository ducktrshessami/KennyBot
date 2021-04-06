const { Command, utils } = require("discord-bot");
const { maxDice, disadvantage, generateReply } = require("../utils/diceHandler");

module.exports = new Command("disadvantage", function (message, args) {
    let query = "d20", results;
    if (args.length > 1) {
        args.shift();
        query = args.join("");
    }
    if (results = disadvantage(query)) {
        utils.sendVerbose(message.channel, generateReply(message.author.id, results[0], results[1].value))
            .catch(console.log);
    }
    else {
        utils.sendVerbose(message.channel, `\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.log);
    }
}, {
    usage: "@kennybot disadvantage [die count]d<sides>[modifiers]",
    description: "Rolls dice with disadvantage. Defaults to a d20 if nothing is specified",
    subtitle: `Max dice count is ${maxDice}`,
    aliases: ["disadv", "disad"]
});
