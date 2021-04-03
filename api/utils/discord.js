const phin = require("phin");
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
        if ((new Date(req.session.discord.expiry)) - Date.now()) {
            refresh(req, res, next);
        }
        else {
            next();
        }
    }
    else {
        res.status(401).redirect(process.env.API_REDIRECT + "?status=1");
    }
}

function refresh(req, res, next) {
    phin({
        url: "https://discord.com/api/oauth2/token",
        method: "post",
        data: (new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: req.session.discord.refresh_token,
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
            next();
        });
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
