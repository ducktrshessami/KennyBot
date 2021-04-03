const phin = require("phin");
const discord = require("../utils/discord");

module.exports = function (router) {
    router.get("/api/login", discord.preLogin, function (req, res) {
        res.redirect(discord.authUrl);
    });

    router.get("/api/auth", function (req, res) {

    });
};
