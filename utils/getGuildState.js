const db = require("../models");

module.exports = function (guildID) {
    return db.Guild.findByPk(guildID, {
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
            let guild = process.bot.guilds.cache.get(guildID);
            if (guild && dbGuild) {
                let state = {
                    song: dbGuild.State.Song,
                    volume: dbGuild.State.volume,
                    playing: dbGuild.State.playing,
                    shuffle: dbGuild.State.shuffle,
                    repeat: dbGuild.State.repeat,
                    playlists: dbGuild.Playlists,
                    voice: null
                };
                if (guild.voice && guild.voice.channel) {
                    state.voice = {
                        channel: guild.voice.channel.name,
                        users: guild.voice.channel.members
                            .map(member => member.nickname || member.user.username)
                    };
                }
                return state;
            }
            else {
                throw new Error("Guild not found");
            }
        });
};
