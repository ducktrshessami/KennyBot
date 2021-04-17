const auth = require("../middleware/auth");
const discord = require("../../utils/discord");

module.exports = function (router) {
    router.get("/api/authorized", auth.refreshCheck, function (req, res) {
        res.status(200).json({ authorized: Boolean(req.session.discord.access_token) });
    });

    router.get("/api/login", auth.preLogin, function (req, res) {
        res.redirect(discord.authUrl + `&state=${req.session.discord.state}`);
    });

    router.get("/api/logout", auth.preLogout, function (req, res) {
        req.session.regenerate(function (err) {
            if (err) {
                console.error(err);
            }
            res.status(200).redirect(process.env.API_REDIRECT);
        });
    });

    router.get("/api/auth", auth.preAuth, function (req, res) {
        discord.getToken(req.query.code)
            .then(tokenRes => {
                if (tokenRes.statusCode === 200) {
                    req.session.discord.access_token = tokenRes.body.access_token;
                    req.session.discord.expiry = new Date(Date.now() + (tokenRes.body.expires_in));
                    req.session.discord.refresh_token = tokenRes.body.refresh_token;
                    req.session.cookie.expires = req.session.discord.expiry;
                    res.status(200).redirect(process.env.API_REDIRECT + "?status=0");
                }
                else {
                    res.redirect("/api/unauth");
                }
            });
    });

    router.get("/api/unauth", function (req, res) {
        req.session.regenerate(function (err) {
            if (err) {
                console.error(err);
            }
            res.status(401).redirect(process.env.API_REDIRECT + "?status=1");
        });
    });
};
