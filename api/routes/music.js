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

    router.post("/api/play/:guildId/:songId", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(guild => guild.id === req.params.guildId)) {
            db.Song.findByPk(req.params.songId, {
                include: {
                    model: db.Playlist,
                    include: {
                        model: db.Guild,
                        include: db.State
                    }
                }
            })
                .then(song => {
                    if (song && song.Playlist.Guild.id === req.params.guildId) {
                        if (music.playURL(req.params.guildId, song, song.Playlist.Guild.State.volume)) {
                            song.Playlist.Guild.State.update({
                                SongId: song.id,
                                playing: true
                            });
                            res.status(200).end();
                        }
                        else {
                            res.status(400).end();
                        }
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
            res.status(401).end();
        }
    });
};
