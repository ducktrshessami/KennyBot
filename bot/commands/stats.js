const { Command, utils } = require("discord-bot");
const { maxDice, stats } = require("../utils/diceHandler");

module.exports = new Command("stat", function (message, args) {
    let count = Number(args[1]) || 4, results;
    if (results = stats(count)) {
        utils.sendVerbose(message.channel, "<@" + message.author.id + "> `" + results + "`")
            .catch(console.log);
    }
    else {
        utils.sendVerbose(message.channel, `\`${this.usage}\`\n${this.subtitle}`)
            .catch(console.log);
    }
}, {
    usage: "@kennybot stat [dice count]",
    description: "Rolls a set of stats based on a number of d6s, best three summed with 1s rerolled once",
    subtitle: `Defaults to 4d6. Max dice count is ${maxDice}`
});
