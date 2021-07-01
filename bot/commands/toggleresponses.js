const { Command, utils } = require("discord-bot");
const db = require("../../models");
const sendAudit = require("../utils/sendAudit");

module.exports = new Command("toggleresponses", function (message) {
    db.Guild.findByPk(message.guild.id)
        .then(guild => guild.update({ respond: !guild.respond }))
        .then(guild => {
            this.client.responses.forEach(response => {
                let index = response.serverBlacklist.indexOf(guild.id);
                if (guild.respond && index !== -1) {
                    response.serverBlacklist.splice(index, 1);
                }
                else if (!guild.respond && index === -1) {
                    response.serverBlacklist.push(guild.id);
                }
            });
            return Promise.all([
                sendAudit(message.guild.id, message.author, `toggled chat responses \`${guild.respond ? "on" : "off"}\``),
                utils.sendVerbose(message.channel, `Toggled chat responses \`${guild.respond ? "on" : "off"}\``)
            ]);
        })
        .catch(console.error);
}, {
    requirePerms: "ADMINISTRATOR",
    usage: "@kennybot toggleresponses",
    description: "Toggles chat responses for the server",
    aliases: ["responses", "respond", "toggleresponse", "togglerespond"]
});
