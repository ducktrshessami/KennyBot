const { Response, utils } = require("discord-bot");
const config = require("../../config/bot.json");

try {
    let parsedServers = JSON.parse(process.env.BOT_DEFRESLIST);
    if (parsedServers) {
        config.resOptions.default.servers = parsedServers;
    }
}
catch {
    console.warn("Could not parse env BOT_DEFRESLIST as JSON");
}

module.exports = new Response("kenny", undefined, undefined, function (message) {
    utils.sendVerbose(message.channel, this.client.emojis.cache.random().toString())
        .catch(console.error);
}, {
    serverWhitelist: config.resOptions.default.servers
});
