const discord = require("../../utils/discord");
const user = require("../../utils/user");

module.exports = function (router) {
    router.get("/api/user", discord.authCheck, function (req, res) {
        discord.getUser(req.session.discord.access_token)
            .then(userResponse => {
                if (userResponse.statusCode === 200) {
                    return user.initUser(userResponse.body)
                        .then(() => {
                            res.status(200).json(userResponse.body);
                        });
                }
                else {
                    res.status(401).end();
                }
            })
            .catch(console.error);
    });

    router.get("/api/user/guilds", function (req, res) {

    });
};
