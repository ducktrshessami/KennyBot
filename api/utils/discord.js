const hash = require("./hash");

const scope = "identify guilds";
const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.CLIENT_REDIRECT}&response_type=code&scope=${scope}`;

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
        if (req.session.discord.expiry - Date.now()) {
            refresh(req, res, next);
        }
    }
    else {
        res.status(401).redirect(process.env.API_REDIRECT + "?status=1");
    }
}

function refresh(req, res, next) {
    next();
}

module.exports = {
    authUrl,
    preLogin,
    preAuth,
    scope,
    authCheck,
    refresh,
    init
};
