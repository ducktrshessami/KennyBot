const { Command, utils } = require("discord-bot");

module.exports = new Command("invite", function (message) {
    utils.sendVerbose(message.channel, `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=3468352&scope=bot`)
        .catch(console.error);
}, {
    usage: "@kennybot invite",
    description: "Send a link to invite KennyBot to a server"
});
