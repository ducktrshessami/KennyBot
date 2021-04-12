const { Command, utils } = require("discord-bot");
const { maxDice, exploding, generateReply } = require("../utils/dice");

module.exports = new Command("exploding", function (message, args) {
    let query = args.slice(1).join("") || "d20", result;
    if (result = exploding(query)) {
        utils.sendVerbose(message.channel, generateReply(message.author, result, null, true))
            .catch(console.error);
    }
    else {
        utils.sendVerbose(message.channel, `${message.author}\n\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.error);
    }
}, {
    usage: "@kennybot exploding [die count]d<sides>[modifiers]",
    description: "Rolls dice, but with exploding dice. Defaults to a d20 if nothing is specified",
    subtitle: `Max dice count is ${maxDice}`,
    aliases: ["exp", "explode"]
});
