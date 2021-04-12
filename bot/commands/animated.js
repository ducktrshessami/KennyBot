const { Command, utils } = require("discord-bot");

module.exports = new Command("animated", function (message, args) {
    let results = [];
    args.slice(1).forEach(query => {
        let target = message.guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === query.toLowerCase());
        if (target) {
            results.push(target);
        }
    });
    if (results.length) {
        utils.sendVerbose(message.channel, results.map(emoji => `${emoji}: ${emoji.id}`).join("\n"))
            .catch(console.error);
    }
    else {
        utils.sendVerbose(message.channel, `${message.author}\n\`${this.usage}\``)
            .catch(console.error);
    }
}, {
    admin: true,
    usage: "@kennybot animated <emoji names>",
    description: "Get the id of an animated emoji",
    aliases: ["anim"]
});
