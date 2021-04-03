const phin = require("phin");
const discord = require("../utils/discord");

module.exports = function (router) {
    router.get("/api/user", discord.authCheck, function (req, res) {
        res.end();
    });

    router.get("/login", discord.preLogin, function (req, res) {
        res.redirect(discord.authUrl + `&state=${req.session.discord.state}`);
    });

    router.get("/logout", function (req, res) {
        req.session.regenerate(function (err) {
            if (err) {
                console.error(err);
            }
            res.status(200).redirect(process.env.API_REDIRECT);
        });
    });

    router.get("/api/auth", discord.preAuth, function (req, res) {
        phin({
            url: "https://discord.com/api/oauth2/token",
            method: "post",
            data: (new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: "authorization_code",
                code: req.query.code,
                redirect_uri: process.env.CLIENT_REDIRECT,
                scope: discord.scope
            })).toString(),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            parse: "json"
        })
            .then(tokenRes => {
                req.session.discord.access_token = tokenRes.body.access_token;
                req.session.discord.expiry = new Date(Date.now() + (tokenRes.body.expires_in * 1000));
                req.session.discord.refresh_token = tokenRes.body.refresh_token;
                req.session.cookie.expires = req.session.discord.expiry;
                res.status(200).redirect(process.env.API_REDIRECT + "?status=0");
            });
    });

    router.get("/api/unauth", function (req, res) {
        req.session.regenerate(function (err) {
            if (err) {
                console.error(err);
            }
            res.status(401).redirect(process.env.API_REDIRECT + "?status=2");
        });
    });
};
