const { Response, utils } = require("discord-bot");
const cooldown = require("with-cooldown").default;
const config = require("../../config/bot.json");

module.exports = new Response(["good shit"], "👌👀👌👀👌👀👌👀👌👀 good shit go౦ԁ sHit👌 thats ✔ some good👌👌shit right👌👌there👌👌👌 right✔there ✔✔if i do ƽaү so my self 💯 i say so 💯 thats what im talking about right there right there (chorus: ʳᶦᵍʰᵗ ᵗʰᵉʳᵉ) mMMMMᎷМ💯 👌👌 👌НO0ОଠOOOOOОଠଠOoooᵒᵒᵒᵒᵒᵒᵒᵒᵒ👌 👌👌 👌 💯 👌 👀 👀 👀 👌👌Good shit", undefined, cooldown(config.resOptions.cooldown, function (message, response) {
    utils.sendVerbose(message.channel, response)
        .catch(console.error);
}));
