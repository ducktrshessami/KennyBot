const auth = require("../middleware/auth");
const music = require("../../utils/music");

module.exports = function (router) {
    router.post("/api/volume/:guildId/:volume", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(guild => guild.id === req.params.guildId)) {
            music.changeVolume(req.params.guildId, req.params.volume)
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
            music.playPlaylist(req.params.guildId, req.params.playlistId)
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

    router.post("/api/play/shuffle/:guildId/:playlistId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(guild => guild.id === req.params.guildId)) {
            music.shufflePlayPlaylist(req.params.guildId, req.params.playlistId)
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
