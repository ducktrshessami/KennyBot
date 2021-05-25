const discord = require("../../../utils/discord");

module.exports = function (socket, next) {
    if (socket.request.session.discord.access_token) {
        discord.getUser(socket.request.session.discord.access_token)
            .then(res => {
                if (res.statusCode === 200) {
                    socket.handshake.auth.userID = res.body.id;
                    next();
                }
                else {
                    throw new Error();
                }
            })
            .catch(() => next(new Error("Failed to obtain user info")));
    }
    else {
        next(new Error("Not authorized"));
    }
};
