const db = require("../../models");

module.exports = function (guild) {
    return db.Guild.findByPk(guild.id, { include: db.State })
        .then(dbGuild => {
            if (dbGuild) {
                process.bot.config.servers[guild.id].prefix = dbGuild.prefix;
                return dbGuild.update(guild)
                    .then(() => {
                        if (!dbGuild.State) {
                            return db.State.create({ GuildId: guild.id });
                        }
                    })
                    .then(() => {
                        if (dbGuild.State && (dbGuild.State.playing || dbGuild.State.paused || dbGuild.State.lastNotQueue || dbGuild.State.SongId)) {
                            return dbGuild.State.update({
                                playing: false,
                                paused: false,
                                lastNotQueue: null,
                                SongId: null
                            });
                        }
                    });
            }
            else {
                return db.Guild.create(guild)
                    .then(guild => db.State.create({ GuildId: guild.id }));
            }
        });
};
