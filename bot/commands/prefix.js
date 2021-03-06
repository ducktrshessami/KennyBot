const { Command, utils } = require("discord-bot");
const db = require("../../models");
const sendAudit = require("../utils/sendAudit");

module.exports = new Command("prefix", function (message, args) {
    db.Guild.findByPk(message.guild.id)
        .then(guild => {
            if (args.length > 1 && message.member.hasPermission("ADMINISTRATOR")) {
                this.client.config.servers[message.guild.id].prefix = args[1];
                return guild.update({ prefix: args[1] })
                    .then(() => sendAudit(message.guild.id, message.author, `set custom prefix to \`${args[1]}\``))
                    .then(() => utils.sendVerbose(message.channel, `Custom prefix set to \`${args[1]}\``));
            }
            else {
                if (guild.prefix) {
                    return utils.sendVerbose(message.channel, `Current custom prefix: \`${guild.prefix}\``);
                }
                else {
                    return utils.sendVerbose(message.channel, "Custom prefix not set");
                }
            }
        })
        .catch(console.error);
}, {
    usage: "@kennybot prefix [prefix]",
    description: "View or change the command prefix",
    subtitle: "Only admins can change the prefix"
});
