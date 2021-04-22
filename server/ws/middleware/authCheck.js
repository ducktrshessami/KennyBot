const { refreshToken } = require("../../../utils/discord");

function refreshCheck(discord) {
    return new Promise((resolve, reject) => {
        if ((new Date(discord.expiry)) - Date.now() <= 0) {
            refreshToken(discord.refresh_token)
                .then(res => {
                    if (res.statusCode === 200) {
                        resolve(res.body);
                    }
                    else {
                        reject();
                    }
                })
                .catch(reject);
        }
        else {
            resolve();
        }
    });
}

module.exports = function (socket, next) {
    if (socket.request.session.discord.access_token) {
        refreshCheck(socket.request.session.discord)
            .then(discord => {
                if (discord) {
                    socket.request.session.discord.access_token = discord.access_token;
                    socket.request.session.discord.expiry = new Date(Date.now() + (discord.expires_in * 1000));
                    socket.request.session.discord.refresh_token = discord.refresh_token;
                }
                next();
            })
            .catch(() => next(new Error("Failed to refresh access token")));
    }
    else {
        next(new Error("Not authorized"));
    }
};
