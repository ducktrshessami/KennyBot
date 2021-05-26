const auth = require("../middleware/auth");
const audit = require("../../../utils/audit");
const db = require("../../../models");
const audio = require("../../../utils/audio");
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

    router.post("/api/guild/song/:guildId/:playlistId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            db.Playlist.findByPk(req.params.playlistId, {
                include: db.Song,
                order: [[db.Song, "order"]]
            })
                .then(playlist => {
                    if (playlist) {
                        let lastSong = playlist.Songs[playlist.Songs.length - 1];
                        return audio.getTitle(req.body.url)
                            .then(title => db.Song.create({
                                title,
                                url: audio.formatUrl(req.body.url),
                                source: audio.getSource(req.body.url),
                                order: lastSong ? lastSong.order + 1 : 0,
                                PlaylistId: req.params.playlistId
                            }))
                            .then(song => {
                                emitStateUpdate(req.params.guildId);
                                res.status(200).json(song);
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

    router.post("/api/guild/import/:guildId/:playlistId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            db.Playlist.findByPk(req.params.playlistId, {
                include: db.Song,
                order: [[db.Song, "order"]]
            })
                .then(playlist => {
                    if (playlist) {
                        let lastSong = playlist.Songs[playlist.Songs.length - 1];
                        let lastOrder = -1;
                        if (lastSong) {
                            lastOrder = lastSong.order;
                        }
                        return audio.parsePlaylist(req.body.url)
                            .then(tracks => Promise.all(tracks.map((track, i) => db.Song.create({
                                ...track,
                                order: lastOrder + i + 1,
                                PlaylistId: req.params.playlistId
                            }))))
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

    router.get("/api/guild/audit/:guildId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            audit.get(req.params.guildId)
                .then(auditLog => res.status(200).json(auditLog))
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
