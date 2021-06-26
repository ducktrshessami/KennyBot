const { Command } = require("discord-bot");

module.exports = new Command("audit", function (message) {

}, {
    owner: true,
    usage: "@kennybot audit",
    description: "Designates a channel to log significant command usage",
    subtitle: "Only the server owner can use this command",
    aliases: ["audithere", "auditlog", "log"]
});
