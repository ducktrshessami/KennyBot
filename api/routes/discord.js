const phin = require("phin");
const discord = require("../utils/discord");

module.exports = function (router) {
    router.get("/api/login", discord.preLogin, function (req, res) {
        res.redirect(discord.authUrl + `&state=${req.session.discord.state}`);
    });

    router.get("/api/auth", discord.preAuth, function (req, res) {

    });

    router.get("/api/unauth", function (req, res) {
        req.session.regenerate();
        res.status(401).redirect(process.env.API_REDIRECT + "?error=1");
    });
};
