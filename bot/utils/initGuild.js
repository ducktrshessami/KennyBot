const db = require("../../models");

module.exports = function (guild) {
    return db.Guild.findByPk(guild.id)
        .then(dbGuild => {
            if (dbGuild) {
                return dbGuild.update(guild);
            }
            else {
                db.Guild.create(guild);
            }
        })
};
