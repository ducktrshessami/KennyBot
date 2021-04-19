const db = require("../../models");
const auth = require("../middleware/auth");
const music = require("../../utils/music");

module.exports = function (router) {
    router.post("/api/volume/:guildId/:volume", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(guild => guild.id === req.params.guildId)) {
            let vol = Math.max(0, Math.min(1.5, req.params.volume));
            db.Guild.findByPk(req.params.guildId, { include: db.State })
                .then(guild => guild.State.update({ volume: vol }))
                .then(() => music.changeVolume(req.params.guildId, vol))
                .then(() => res.status(200).end())
                .catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        }
        else {
            res.status(401).end();
        }
    });

    router.post("/api/play/song/:guildId/:songId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(guild => guild.id === req.params.guildId)) {
            music.playSong(req.params.guildId, req.params.songId)
                .then(success => {
                    if (success) {
                        res.status(200).end();
                    }
                    else {
                        res.status(400).end();
                    }
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        }
        else {
            res.status(401).end();
        }
    });

    router.post("/api/play/playlist/:guildId/:playlistId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(guild => guild.id === req.params.guildId)) {
            music.playFirstInPlaylist(req.params.guildId, req.params.playlistId)
                .then(success => {
                    if (success) {
                        res.status(200).end();
                    }
                    else {
                        res.status(400).end();
                    }
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        }
        else {
            res.status(401).end();
        }
    });
};
