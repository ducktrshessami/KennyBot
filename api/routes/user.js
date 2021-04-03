const discord = require("../utils/discord");

module.exports = function (router) {
    router.get("/api/user", discord.authCheck, function (req, res) {
        discord.getUser(req.session.discord.access_token)
            .then(userResponse => {
                if (userResponse.statusCode === 200) {
                    res.status(200).json(userResponse.body);
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
