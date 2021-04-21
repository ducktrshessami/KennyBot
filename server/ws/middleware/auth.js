const { getAuthGuilds } = require("../../../utils/user");

module.exports = function (socket, next) {
    if (socket.handshake.auth.guildID) {
        getAuthGuilds(socket.request.session.discord.access_token)
            .then(guilds => {
                if (guilds && guilds.some(guild => guild.id === socket.handshake.auth.guildID)) {
                    next();
                }
                else {
                    throw new Error("Could not get guild");
                }
            })
            .catch(next);
    }
    else {
        next(new Error("Must specify guild ID"));
    }
};
