const db = require("../../models");
const { clearQueue } = require("../../utils/music");

function initGuild(guild) {
    return db.Guild.findByPk(guild.id)
        .then(dbGuild => {
            if (dbGuild) {
                return dbGuild.update(guild);
            }
            else {
                return db.Guild.create(guild);
            }
        });
}

function initState(guildID) {
    return db.State.findOne({
        where: { GuildId: guildID }
    })
        .then(state => {
            if (state) {
                return state.update({
                    playing: false,
                    paused: false,
                    lastNotQueue: null,
                    SongId: null
                });
            }
            else {
                return db.State.create({ GuildId: guildID });
            }
        });
}

module.exports = function (guild) {
    return Promise.all([
        initGuild(guild),
        initState(guild.id),
    ])
        .then(() => clearQueue(guild.id))
};
