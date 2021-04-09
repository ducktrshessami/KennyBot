const { Response, utils } = require("discord-bot");
const cooldown = require("with-cooldown").default;

module.exports = new Response(["imagine"], "Imagine dragons", undefined, cooldown(60000, function (message, response) {
    utils.sendVerbose(message.channel, response)
        .catch(console.error);
}), {

});
