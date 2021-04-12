const { Response, utils } = require("discord-bot");
const cooldown = require("with-cooldown").default;
const config = require("../../config/bot.json");

module.exports = new Response(["fuck", "kenny"], "<:bab:670793508873043979>", undefined, cooldown(config.resOptions.cooldown, function (message, response) {
    utils.sendVerbose(message.channel, response)
        .catch(console.error);
}));
