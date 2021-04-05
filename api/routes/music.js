const db = require("../../models");
const auth = require("../middleware/auth");

module.exports = function (router) {
    router.get("/api/playlists/:guildId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(guild => guild.id === req.params.guildId)) {
            db.Guild.findByPk(req.params.guildId, {
                include: {
                    model: db.Playlist,
                    include: db.Song
                }
            })
                .then(guild => {
                    res.status(200).json(guild.Playlists);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        }
        else {
            res.status(404).end();
        }
    });
};
