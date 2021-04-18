const auth = require("../middleware/auth");
const db = require("../../models");

module.exports = function (router) {
    router.get("/api/guild/:guildID", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildID)) {
            let guild = process.bot.guilds.cache.get(req.params.guildID);
            if (guild) {
                db.Guild.findByPk(req.params.guildID, {
                    attributes: ["id", "name"],
                    include: [
                        {
                            model: db.State,
                            attributes: ["volume", "playing", "shuffle", "repeat"],
                            include: {
                                model: db.Song,
                                attributes: ["id", "title", "url", "source", "PlaylistId"],
                                include: {
                                    model: db.Playlist,
                                    attributes: ["id", "name"]
                                }
                            }
                        },
                        {
                            model: db.Playlist,
                            attributes: ["id", "name", "GuildId"],
                            include: {
                                model: db.Song,
                                attributes: ["id", "title", "url", "source", "order", "PlaylistId"]
                            }
                        }
                    ],
                    order: [
                        [db.Playlist, "name"],
                        [db.Playlist, db.Song, "order"]
                    ]
                })
                    .then(dbGuild => {
                        if (dbGuild) {
                            let response = {
                                id: dbGuild.id,
                                name: dbGuild.name,
                                state: dbGuild.State,
                                playlists: dbGuild.Playlists
                            };
                            if (guild.voice && guild.voice.channel) {
                                response.voice = {
                                    channel: guild.voice.channel.name,
                                    users: guild.voice.channel.members
                                        .map(member => member.nickname || member.user.username)
                                };
                            }
                            res.status(200).json(response);
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
        }
        else {
            res.status(401).end();
        }
    });

    router.post("/api/guild/playlist/:guildId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildId)) {
            db.Playlist.create({
                name: req.body.name,
                GuildId: req.params.guildId
            })
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
            db.Playlist.findByPk(req.params.playlistId)
                .then(playlist => {
                    if (playlist) {
                        return playlist.update(req.body)
                            .then(updated => res.status(200).json(updated));
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
                            .then(() => res.status(200).end());
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
