const { Command } = require("discord-bot");

module.exports = new Command("prune", function (message, args) {
    
}, {
    usage: "@kennybot prune <number> [user]",
    description: "Deletes up to a given number of messages. The deleted messages can be filtered to a specified user",
    subtitle: "Discord only allows up to 100 messages to be deleted at a time"
});
