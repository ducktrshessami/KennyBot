const { Response, utils } = require("discord-bot");
const cooldown = require("with-cooldown").default;
const config = require("../../config/bot.json");

module.exports = new Response(["confirm critical"], "<a:POGGERS:829021354681827380>", undefined, cooldown(config.resOptions.cooldown, function (message, response) {
    utils.sendVerbose(message.channel, response)
        .catch(console.error);
}));
