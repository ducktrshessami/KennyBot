const db = require("../models");

module.exports = {
    log
};

function log(userID, guildID, action) {
    return db.UserAction.create({
        action: action.trim(),
        UserId: userID,
        GuildId: guildID
    });
}
