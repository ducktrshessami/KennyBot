const { Command } = require("discord-bot");
const db = require("../../models");

module.exports = new Command("audit", function (message) {
    db.Guild.findByPk(message.guild.id)
        .then(guild => guild.update({ auditChannel: message.channel.id }))
        .catch(console.error);
}, {
    owner: true,
    usage: "@kennybot audit",
    description: "Designates a channel to log significant command usage",
    subtitle: "Only the server owner can use this command",
    aliases: ["audithere", "auditlog", "log"]
});
