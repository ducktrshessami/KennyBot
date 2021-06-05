const db = require("../models");

module.exports = {
    log,
    get,
    getUsers,
    prune
};

function createActionLog(userID, guildID, actionCode, vars) {
    return db.UserAction.create({
        code: actionCode,
        vars,
        UserId: userID,
        GuildId: guildID
    });
}

function checkLast(userID, guildID, actionCode) {
    return db.UserAction.findOne({
        where: { GuildId: guildID },
        order: [["createdAt", "desc"]]
    })
        .then(last => {
            if (last && last.UserId === userID && last.code === actionCode && Date.now() - last.updatedAt < process.env.AUDIT_RECENT) {
                return last;
            }
        });
}

function replaceable(userID, guildID, actionCode, vars) {
    return checkLast(userID, guildID, actionCode)
        .then(last => {
            if (last) {
                return last.update({ vars });
            }
            else {
                return createActionLog(userID, guildID, actionCode, vars);
            }
        });
}

function appendable(userID, guildID, actionCode, vars) {
    return checkLast(userID, guildID, actionCode)
        .then(last => {
            if (last) {
                return last.update({ vars: db.Sequelize.fn("array_cat", db.Sequelize.col("vars"), db.Sequelize.cast(vars, "character varying[]")) });
            }
            else {
                return createActionLog(userID, guildID, actionCode, vars);
            }
        });
}

function uniqueUpdatable(userID, guildID, actionCode, vars) {
    return checkLast(userID, guildID, actionCode)
        .then(last => {
            if (last) {
                switch (actionCode) {
                    case 14:
                    case 15: return last.update({ vars: db.Sequelize.fn("array_cat", db.Sequelize.col("vars"), db.Sequelize.cast(vars.slice(1), "character varying[]")) });
                    default:
                }
            }
            else {
                return createActionLog(userID, guildID, actionCode, vars);
            }
        });
}

function log(userID, guildID, actionCode, vars = []) {
    switch (actionCode) {
        case 3:
        case 4:
        case 5: return replaceable(userID, guildID, actionCode, vars);
        case 9:
        case 10: return appendable(userID, guildID, actionCode, vars)
        case 14:
        case 15: return uniqueUpdatable(userID, guildID, actionCode, vars);
        default: return createActionLog(userID, guildID, actionCode, vars);
    }
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

function getUsers(guildID) {
    return new Promise((resolve, reject) => {
        let guild = process.bot.guilds.cache.get(guildID);
        if (guild) {
            guild.members.fetch()
                .then(members => members.filter(member => !member.user.bot))
                .then(members => members.map(({ user }) => ({
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator,
                    avatar: user.avatar
                })))
                .then(resolve)
                .catch(reject);
        }
        else {
            db.UserAction.findAll({
                where: { GuildId: guildID },
                include: {
                    model: db.User,
                    attributes: ["id", "username", "discriminator", "avatar"]
                }
            })
                .then(actions => {
                    let obj = {};
                    actions.forEach(action => obj[action.User.id] = action.User);
                    resolve(Object.values(obj));
                })
                .catch(reject);
        }
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
