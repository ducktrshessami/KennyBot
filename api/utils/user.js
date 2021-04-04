const db = require("../../models");

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

module.exports = {
    initUser
};
