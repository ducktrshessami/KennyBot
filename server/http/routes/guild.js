const auth = require("../middleware/auth");
const db = require("../../../models");
const { emitStateUpdate } = require("../../../utils/state");

module.exports = function (router) {
    router.post("/api/guild/playlist/:guildId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            db.Playlist.create({
                name: req.body.name,
                GuildId: req.params.guildId
            })
                .then(playlist => {
                    emitStateUpdate(req.params.guildId);
                    res.status(200).json({
                        id: playlist.id,
                        name: playlist.name
                    });
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

    router.put("/api/guild/playlist/:guildId/:playlistId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            db.Playlist.findByPk(req.params.playlistId)
                .then(playlist => {
                    if (playlist) {
                        return playlist.update(req.body)
                            .then(updated => {
                                emitStateUpdate(req.params.guildId);
                                res.status(200).json(updated);
                            });
                    }
                    else {
                        res.status(404).end();
                    }
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

    router.delete("/api/guild/playlist/:guildId/:playlistId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            db.Playlist.findByPk(req.params.playlistId)
                .then(playlist => {
                    if (playlist) {
                        return playlist.destroy()
                            .then(() => {
                                emitStateUpdate(req.params.guildId);
                                res.status(200).end();
                            });
                    }
                    else {
                        res.status(404).end();
                    }
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

    router.delete("/api/guild/song/:guildId/:songId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            db.Song.findByPk(req.params.songId)
                .then(song => {
                    if (song) {
                        return song.destroy()
                            .then(() => {
                                emitStateUpdate(req.params.guildId);
                                res.status(200).end();
                            });
                    }
                    else {
                        res.status(404).end();
                    }
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
