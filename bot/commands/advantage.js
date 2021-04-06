const { Command, utils } = require("discord-bot");
const { maxDice, advantage, generateReply } = require("../utils/diceHandler");

module.exports = new Command("advantage", function (message, args) {
    let query = args.slice(1).join("") || "d20", results;
    if (results = advantage(query)) {
        utils.sendVerbose(message.channel, generateReply(message.author.id, results[0], results[1].value))
            .catch(console.log);
    }
    else {
        utils.sendVerbose(message.channel, `\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.log);
    }
}, {
    usage: "@kennybot advantage [die count]d<sides>[modifiers]",
    description: "Rolls dice with advantage. Defaults to a d20 if nothing is specified",
    subtitle: `Max dice count is ${maxDice}`,
    aliases: ["adv"]
});
