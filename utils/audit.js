const db = require("../models");

module.exports = {
    log,
    get,
    prune
};

function log(userID, guildID, actionCode, vars = []) {
    return db.UserAction.create({
        code: actionCode,
        vars,
        UserId: userID,
        GuildId: guildID
    });
}

function get(guildID, userFilter, actionFilter) {
    let where = { GuildId: guildID };
    let codeFilter = actionFilter ? actionFilter + 7 : null;
    switch (actionFilter) {
        case 0: codeFilter = { [db.Sequelize.Op.between]: [0, 5] }; break;
        case 1: codeFilter = { [db.Sequelize.Op.between]: [6, 8] }; break;
        default:
    }
    if (userFilter) {
        where.UserId = userFilter;
    }
    if (codeFilter) {
        where.code = codeFilter;
    }
    return db.UserAction.findAll({
        where,
        attributes: ["id", "code", "vars", "createdAt"],
        include: {
            model: db.User,
            attributes: ["username", "discriminator", "avatar"]
        },
        order: [["createdAt", "desc"]],
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
