const phin = require("phin");
const discord = require("../utils/discord");

module.exports = function (router) {
    router.get("/api/authorized", discord.refreshCheck, function (req, res) {
        res.status(200).json({ authorized: Boolean(req.session.discord.access_token) });
    });

    router.get("/login", discord.preLogin, function (req, res) {
        res.redirect(discord.authUrl + `&state=${req.session.discord.state}`);
    });

    router.get("/logout", discord.preLogout, function (req, res) {
        req.session.regenerate(function (err) {
            if (err) {
                console.error(err);
            }
            res.status(200).redirect(process.env.API_REDIRECT);
        });
    });

    router.get("/auth", discord.preAuth, function (req, res) {
        discord.getToken(req.query.code)
            .then(tokenRes => {
                req.session.discord.access_token = tokenRes.access_token;
                req.session.discord.expiry = new Date(Date.now() + (tokenRes.expires_in * 1000));
                req.session.discord.refresh_token = tokenRes.refresh_token;
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
