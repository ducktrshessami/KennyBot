const auth = require("../middleware/auth");
const db = require("../../models");

module.exports = function (router) {
    router.get("/api/guild/:guildID", auth.authCheck, auth.authGuilds, function (req, res) {
        if (req.authGuilds.find(server => server.id === req.params.guildID)) {
            let guild = process.bot.guilds.cache.get(req.params.guildID);
            if (guild) {
                db.Guild.findByPk(req.params.guildID, {
                    attributes: ["id", "volume"],
                    include: {
                        model: db.Playlist,
                        attributes: ["id", "name"],
                        include: {
                            model: db.Song,
                            attributes: ["id", "title", "url", "source", "order"]
                        }
                    },
                    order: [
                        [db.Playlist, "name"],
                        [db.Playlist, db.Song, "order"]
                    ]
                })
                    .then(dbGuild => {
                        if (dbGuild) {
                            let response = {
                                id: dbGuild.id,
                                volume: dbGuild.volume,
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
                        res.status(500);
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
};
