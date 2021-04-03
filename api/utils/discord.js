const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.CLIENT_REDIRECT}&response_type=code&scope=identify%20guilds`

function preLogin(req, res, next) {
    if (req.session.discord.state && req.session.discord.access_token) {
        res.redirect(process.env.API_REDIRECT);
    }
    else {
        next();
    }
}

module.exports = {
    authUrl,
    preLogin
};
