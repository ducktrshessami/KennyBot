const hash = require("../../../utils/hash");
const { refreshToken, revokeToken } = require("../../../utils/discord");
const { getAuthGuilds } = require("../../../utils/user");

function init(req, res, next) {
    if (!req.session.discord) {
        req.session.discord = {};
    }
    next();
}

function preLogin(req, res, next) {
    if (req.session.discord.state && req.session.discord.access_token) {
        res.redirect(process.env.API_REDIRECT);
    }
    else {
        req.session.discord.state = hash(req.session.id);
        next();
    }
}

function preAuth(req, res, next) {
    if (req.query.code && req.query.state === req.session.discord.state) {
        next();
    }
    else {
        res.redirect("/api/unauth");
    }
}

function authCheck(req, res, next) {
    if (req.session.discord.access_token) {
        refreshCheck(req, res, next);
    }
    else {
        res.status(401).end();
    }
}

function refreshCheck(req, res, next) {
    if (req.session.discord.access_token) {
        if ((new Date(req.session.discord.expiry)) - Date.now() > 0) {
            next();
        }
        else {
            refresh(req, res, next);
        }
    }
    else {
        next();
    }
}

function refresh(req, res, next) {
    refreshToken(req.session.discord.refresh_token)
        .then(tokenRes => {
            if (tokenRes.statusCode === 200) {
                req.session.discord.access_token = tokenRes.body.access_token;
                req.session.discord.expiry = new Date(Date.now() + (tokenRes.body.expires_in * 1000));
                req.session.discord.refresh_token = tokenRes.body.refresh_token;
                next();
            }
            else {
                res.redirect("/api/unauth");
            }
        });
}

function preLogout(req, res, next) {
    revokeToken(req.session.discord.access_token, req.session.discord.refresh_token)
        .then(() => next());
}

function authGuilds(req, res, next) {
    getAuthGuilds(req.session.discord.access_token)
        .then(guilds => {
            if (guilds) {
                req.authGuilds = guilds;
                next();
            }
            else {
                res.status(401).end();
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).end();
        });
}

module.exports = {
    init,
    preLogin,
    preAuth,
    preLogout,
    authCheck,
    refreshCheck,
    refresh,
    authGuilds
};
