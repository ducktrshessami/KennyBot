const db = require("../../models");

module.exports = function (guild) {
    return db.Guild.findByPk(guild.id)
        .then(dbGuild => {
            if (dbGuild) {
                process.bot.config.servers[guild.id].prefix = dbGuild.prefix;
                return dbGuild.update(guild);
            }
            else {
                return db.Guild.create(guild)
                    .then(guild => db.State.create({ GuildId: guild.id }));
            }
        });
};
