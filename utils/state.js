const db = require("../models");

module.exports = {
    getNewState,
    emitStateUpdate
};

function getNewState(guildID) {
    return db.Guild.findByPk(guildID, {
        include: [
            {
                model: db.State,
                attributes: ["volume", "playing", "paused", "shuffle", "repeat"],
                include: {
                    model: db.Song,
                    attributes: ["id", "title", "url", "source"],
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
                    attributes: ["id", "title", "url", "source", "order"]
                }
            },
            {
                model: db.Queue,
                attributes: ["id"],
                include: {
                    model: db.Song,
                    attributes: ["id", "title", "url", "source", "order"]
                }
            }
        ],
        order: [
            [db.Sequelize.fn("lower", db.Sequelize.col(`${db.Playlist.getTableName()}.name`))],
            [db.Playlist, db.Song, "order"],
            [db.Queue, "order"]
        ]
    })
        .then(dbGuild => {
            let guild = process.bot.guilds.cache.get(guildID);
            if (guild && dbGuild) {
                let state = {
                    song: dbGuild.State.Song,
                    volume: dbGuild.State.volume,
                    playing: dbGuild.State.playing,
                    paused: dbGuild.State.paused,
                    shuffle: dbGuild.State.shuffle,
                    repeat: dbGuild.State.repeat,
                    playlists: dbGuild.Playlists,
                    queue: dbGuild.Queues,
                    voice: null
                };
                if (guild.voice && guild.voice.channel) {
                    state.voice = {
                        channel: guild.voice.channel.name,
                        users: guild.voice.channel.members
                            .map(member => member.nickname || member.user.username)
                            .sort()
                    };
                }
                return state;
            }
            else {
                throw new Error("Guild not found");
            }
        });
}

function emitStateUpdate(guildID) {
    return getNewState(guildID)
        .then(state => process.socket.to(guildID).emit("stateUpdate", state));
}
