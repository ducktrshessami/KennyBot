const phin = require("phin");
const discord = require("../utils/discord");

module.exports = function (router) {
    router.get("/api/login", discord.preLogin, function (req, res) {
        res.redirect(discord.authUrl + `&state=${req.session.discord.state}`);
    });

    router.get("/api/auth", discord.preAuth, function (req, res) {
        phin({
            url: "https://discord.com/api/oauth2/token",
            method: "post",
            data: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: "authorization_code",
                code: req.query.code,
                redirect_uri: process.env.CLIENT_REDIRECT,
                scope: discord.scope
            },
            parse: "json"
        })
            .then(tokenRes => {

            });
    });

    router.get("/api/unauth", function (req, res) {
        req.session.regenerate(function (err) {
            if (err) {
                console.error(err);
            }
            res.status(401).redirect(process.env.API_REDIRECT + "?error=1");
        });
    });
};
