const db = require("../../models");
const auth = require("../middleware/auth");
const music = require("../../utils/music");

module.exports = function (router) {
    router.post("/api/volume/:guildId/:volume", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(guild => guild.id === req.params.guildId)) {
            let vol = Math.max(0, Math.min(1.5, req.params.volume));
            db.Guild.findByPk(req.params.guildId)
                .then(guild => guild.update({ volume: vol }))
                .then(() => music.changeVolume(req.params.guildId, vol))
                .then(() => res.status(200).end())
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
