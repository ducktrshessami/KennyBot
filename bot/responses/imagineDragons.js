const { Response, utils } = require("discord-bot");
const cooldown = require("with-cooldown").default;
const config = require("../../config/bot.json");

try {
    let parsedDragons = JSON.parse(process.env.BOT_DRAGONS);
    if (parsedDragons) {
        config.resOptions.imagine.dragons = parsedDragons;
    }
}
catch {
    console.warn("Could not parse env BOT_DRAGONS as JSON");
}

module.exports = new Response(["imagine"], "Imagine dragons", undefined, cooldown(60000, function (message, response) {
    utils.sendVerbose(message.channel, response)
        .catch(console.error);
}), {
    serverWhitelist: config.resOptions.imagine.dragons
});
