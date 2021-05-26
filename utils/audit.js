const db = require("../models");

module.exports = {
    log,
    get,
    prune
};

function log(userID, guildID, actionType, vars = []) {
    return db.UserAction.create({
        type: actionType,
        vars,
        UserId: userID,
        GuildId: guildID
    });
}

function get(guildID) {
    return db.UserAction.findAll({
        where: { GuildId: guildID },
        order: ["createdAt", "desc"]
    });
}

function prune() {
    return new Promise((resolve, reject) => {
        if (process.env.AUDIT_LIFE) {
            db.UserAction.destroy({
                where: {
                    createdAt: { [db.Sequelize.Op.lt]: new Date(Date.now() - process.env.AUDIT_LIFE) }
                }
            })
                .then(resolve)
                .catch(reject);
        }
        else {
            resolve();
        }
    });
}
