const phin = require("phin");

const scope = "identify guilds";
const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.bot.user.id}&redirect_uri=${process.env.CLIENT_REDIRECT}&response_type=code&scope=${scope}`;

function handleLimit(response, retry, ...params) {
    if (response.statusCode === 429 && response.body.retry_after) {
        return new Promise((resolve, reject) => setTimeout(resolve, response.body.retry_after))
            .then(() => retry(...params));
    }
    else {
        return response;
    }
}

function getToken(code) {
    return phin({
        url: "https://discord.com/api/oauth2/token",
        method: "post",
        data: (new URLSearchParams({
            client_id: process.bot.user.id,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: process.env.CLIENT_REDIRECT,
            scope: scope
        })).toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        parse: "json"
    });
}

function refreshToken(refresh_token) {
    return phin({
        url: "https://discord.com/api/oauth2/token",
        method: "post",
        data: (new URLSearchParams({
            client_id: process.bot.user.id,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: refresh_token,
            redirect_uri: process.env.CLIENT_REDIRECT,
            scope: scope
        })).toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        parse: "json"
    });
}

function revokeToken(access_token, refresh_token) {
    return Promise.all([
        revokeHelper(access_token, "access_token"),
        revokeHelper(refresh_token, "refresh_token")
    ]);
}

function revokeHelper(token, type) {
    return phin({
        url: "https://discord.com/api/oauth2/token/revoke",
        method: "post",
        data: (new URLSearchParams({
            token: token,
            token_type_hint: type
        })).toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        parse: "json"
    });
}

function getUser(access_token) {
    return phin({
        url: "https://discord.com/api/users/@me",
        headers: { Authorization: `Bearer ${access_token}` },
        parse: "json"
    })
        .then(res => handleLimit(res, getUser, access_token));
}

function getUserGuilds(access_token) {
    return phin({
        url: "https://discord.com/api/users/@me/guilds",
        headers: { Authorization: `Bearer ${access_token}` },
        parse: "json"
    })
        .then(res => handleLimit(res, getUserGuilds, access_token));
}

module.exports = {
    authUrl,
    scope,
    getToken,
    refreshToken,
    revokeToken,
    getUser,
    getUserGuilds
};
