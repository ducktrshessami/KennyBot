const { Command } = require("discord-bot");
const sendAudit = require("../utils/sendAudit");

module.exports = new Command("toggleresponses", function (message) {

}, {
    requirePerms: "ADMINISTRATOR",
    usage: "@kennybot toggleresponses",
    description: "Toggles chat responses",
    aliases: ["responses", "respond", "toggleresponse", "togglerespond"]
});
