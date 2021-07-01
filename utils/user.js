const db = require("../models");
const discord = require("./discord");

module.exports = {
    initUser,
    getAuthGuilds
};

function initUser(userData) {
    return db.User.findByPk(userData.id)
        .then(user => {
            if (user) {
                return user.update(userData);
            }
            else {
                return db.User.create(userData);
            }
        })
}

function getAuthGuilds(access_token) {
    return Promise.all([
        discord.getUserGuilds(access_token),
        db.Guild.findAll({
            attributes: [
                "id",
                "name",
                "icon",
                "ownerID"
            ]
        })
    ])
        .then(([guildRes, kennyGuilds]) => {
            if (guildRes.statusCode === 200) {
                return guildRes.body
                    .filter(userGuild => process.bot.guilds.cache.has(userGuild.id) && kennyGuilds.some(kennyGuild => userGuild.id === kennyGuild.id))
                    .map(({ id, name, icon, owner }) => ({ id, name, icon, owner }));
            }
        });
}
