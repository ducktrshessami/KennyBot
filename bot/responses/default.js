const { Response, utils } = require("discord-bot");

module.exports = new Response(["kenny"], undefined, function (message, trigger) {
    return message.author.id !== this.client.user.id && trigger.every(tr => message.content.toLowerCase().includes(tr.toLowerCase().trim()));
}, function (message) {
    utils.sendVerbose(message.channel, this.client.emojis.cache.random().toString())
        .catch(console.error);
});
