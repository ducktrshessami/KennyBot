const { Command, utils } = require("discord-bot");
const { maxDice, exploding, generateReply } = require("../utils/diceHandler");

module.exports = new Command("exploding", function (message, args) {
    let query = "d20", result;
    if (args.length > 1) {
        args.shift();
        query = args.join("");
    }
    if (result = exploding(query)) {
        utils.sendVerbose(message.channel, generateReply(message.author.id, result, null, true))
            .catch(console.log);
    }
    else {
        utils.sendVerbose(message.channel, `\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.log);
    }
}, {
    usage: "@kennybot exploding [die count]d<sides>[modifiers]",
    description: "Rolls dice, but with exploding dice. Defaults to a d20 if nothing is specified",
    subtitle: `Max dice count is ${maxDice}`,
    aliases: ["exp", "explode"]
});
