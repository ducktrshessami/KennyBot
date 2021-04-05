const { Command, utils } = require("discord-bot");

function getFilteredMessages(channel, filterIDs, limit) {
    return channel.messages.cache
        .filter(message => (Date.now() - message.createdAt < 1209600000) && filterIDs.includes(message.author.id))
        .last(limit);
}

module.exports = new Command("prune", function (message, args) {
    let count = Number(args[1]);
    if (count && count > 0 && count <= 100) {
        let targets = count;
        let filterIDs = args.slice(2)
            .join(" ")
            .match(/<@[0-9]+>|<@![0-9]+>/g)
            .map(mention => mention.match(/[0-9]+/)[0]);
        if (filterIDs.length) {
            targets = getFilteredMessages(message.channel, filterIDs, count);
        }
        message.channel.bulkDelete(targets, true)
            .then(deleted => {
                return utils.sendVerbose(message.channel, `Pruned \`${deleted.size}\` messages. This message will self-destruct in 5 seconds`)
                    .then(response => response.delete({ timeout: 5000 }));
            })
            .catch(err => {
                console.error(err);
                utils.sendVerbose(message.channel, "There was an error pruning messages")
                    .catch(console.error);
            });
    }
    else {
        utils.sendVerbose(message.channel, `${this.usage}\n${this.subtitle}`)
            .catch(console.log);
    }
}, {
    usage: "@kennybot prune <number> [user]",
    description: "Deletes up to a given number of messages. The deleted messages can be filtered to a specified user",
    subtitle: "Discord only allows up to 100 messages to be deleted at a time"
});
