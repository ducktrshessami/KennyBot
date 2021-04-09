const { Response, utils } = require("discord-bot");

module.exports = new Response(["kenny"], undefined, undefined, function (message) {
    utils.sendVerbose(message.channel, this.client.emojis.cache.random().toString())
        .catch(console.error);
});
