const { Command } = require("discord-bot");
const db = require("../../models");
const sendAudit = require("../utils/sendAudit");

module.exports = new Command("audit", function (message) {
    db.Guild.findByPk(message.guild.id)
        .then(guild => guild.update({ auditChannel: message.channel.id }))
        .then(() => sendAudit(message.guild.id, message.author, `designated <#${message.channel.id}> as the audit log channel`))
        .catch(console.error);
}, {
    owner: true,
    usage: "@kennybot audit",
    description: "Designates a channel to log significant command usage",
    subtitle: "Only the server owner can use this command",
    aliases: ["audithere", "auditlog", "log"]
});
