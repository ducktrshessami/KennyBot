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

module.exports = new Response("imagine", "Just imagine", function (message, trigger) {
    let symbolIndex = message.cleanContent.match(/[$-/:-?{-~!"^_`\[\]]/) || {};
    return message.cleanContent.slice(0, Math.min(16, symbolIndex.index || 16)).toLowerCase().trim().includes(trigger);
}, cooldown(config.resOptions.cooldown, function (message, response) {
    utils.sendVerbose(message.channel, response)
        .catch(console.error);
}), {
    serverBlacklist: config.resOptions.imagine.dragons
});
