const auth = require("../middleware/auth");
const audit = require("../../../utils/audit");
const music = require("../../../utils/music");

module.exports = function (router) {
    router.post("/api/guild/playlist/:guildId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            music.createPlaylist(req.params.guildId, req.body.name, req.session.discord.userID)
                .then(playlist => res.status(200).json({
                    id: playlist.id,
                    name: playlist.name
                }))
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
            music.renamePlaylist(req.params.guildId, req.params.playlistId, req.body.name, req.session.discord.userID)
                .then(playlist => res.status(200).json({
                    id: playlist.id,
                    name: playlist.name
                }))
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
            music.deletePlaylist(req.params.guildId, req.params.playlistId, req.session.discord.userID)
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

    router.post("/api/guild/song/:guildId/:playlistId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            music.addSong(req.params.guildId, req.params.playlistId, req.body.url, req.session.discord.userID)
                .then(song => res.status(200).json(song))
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
            music.deleteSong(req.params.guildId, req.params.songId, req.session.discord.userID)
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

    router.post("/api/guild/import/:guildId/:playlistId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            music.importPlaylist(req.params.guildId, req.params.playlistId, req.body.url, req.session.discord.userID)
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

    router.get("/api/guild/audit/:guildId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            audit.get(req.params.guildId, req.query.user, Number(req.query.action))
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

    router.get("/api/guild/members/:guildId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            audit.getUsers(req.params.guildId)
                .then(users => res.status(200).json(users))
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
