const db = require("../models");
const audio = require("./audio");

module.exports = {
    changeVolume,
    pause,
    resume,
    skip,
    playSong,
    playFirstInPlaylist,
    playRandomInCurrentPlaylist,
    playRandomInPlaylist
};

function findGuild(guildID) {
    return process.bot.guilds.cache.get(guildID);
}

function handleSongEnd(guildID, skip = false) {
    db.Guild.findByPk(guildID, {
        include: [db.Queue, db.State],
        order: [[db.Queue, "createdAt"]]
    })
        .then(guild => {
            if (guild.Queues.length) {
                return playNextQueue(guildID);
            }
            else if (!skip && guild.State.repeat === 1) {
                return playSong(guildID, guild.State.SongId, guild.State.SongId === guild.State.lastNotQueue);
            }
            else if (guild.State.shuffle) {
                return playRandomInCurrentPlaylist(guildID);
            }
            else {
                return playNextInPlaylist(guildID, Boolean(guild.State.repeat));
            }
        })
        .catch(console.error);
}

function playNextQueue(guildID) {
    return db.Guild.findByPk(guildID, {
        include: db.Queue,
        order: [[db.Queue, "createdAt"]]
    })
        .then(guild => playSong(guildID, guild.Queues[0].SongId, true));
}

function playNextInPlaylist(guildID, repeatAll = false) {
    return findLastNotQueue(guildID)
        .then(lastNotQueue => {
            if (lastNotQueue) {
                return lastNotQueue.Playlist.Songs.find(song => song.order === lastNotQueue.order + 1);
            }
        })
        .then(song => {
            if (song) {
                return playSong(guildID, song.id);
            }
            else if (repeatAll) {
                return playFirstInCurrentPlaylist(guildID);
            }
        });
}

function findLastNotQueue(guildID) {
    return db.Guild.findByPk(guildID, { include: db.State })
        .then(guild => {
            if (guild && guild.State.lastNotQueue) {
                return db.Song.findByPk(guild.State.lastNotQueue, {
                    include: {
                        model: db.Playlist,
                        include: db.Song
                    },
                    order: [[db.Playlist, db.Song, "order"]]
                });
            }
        });
}

function playFirstInCurrentPlaylist(guildID) {
    return findLastNotQueue(guildID)
        .then(lastNotQueue => {
            if (lastNotQueue) {
                return lastNotQueue.Playlist.Songs[0];
            }
        })
        .then(song => {
            if (song) {
                return playSong(guildID, song.id);
            }
        });
}

function playFirstInPlaylist(guildID, playlistID) {
    return db.Playlist.findByPk(playlistID, {
        include: db.Song,
        order: [[db.Song, "order"]]
    })
        .then(playlist => {
            if (playlist.Songs.length) {
                return playSong(guildID, playlist.Songs[0].id);
            }
        });
}

function playRandomInCurrentPlaylist(guildID) {
    return findLastNotQueue(guildID)
        .then(lastNotQueue => {
            if (lastNotQueue) {
                return playSong(guildID, pickNewRandomFromList(lastNotQueue.Playlist.Songs, lastNotQueue));
            }
        })
}

function playRandomInPlaylist(guildID, playlistID) {
    return db.Playlist.findByPk(playlistID, {
        include: db.Song,
        order: [[db.Song, "order"]]
    })
        .then(pickNewRandomFromList)
        .then(song => {
            if (song) {
                return playSong(guildID, song.id);
            }
        });
}

function pickNewRandomFromList(list, old = { id: null }) {
    if (list.length) {
        if (list.length === 1) {
            return old;
        }
        else {
            let random;
            do {
                random = list[Math.floor(Math.random() * list.length)];
            } while (random.id === old.id);
            return random;
        }
    }
}

function updateGuildState(guildID, stateData) {
    return db.Guild.findByPk(guildID, { include: db.State })
        .then(guild => guild.State.update(stateData));
}

function changeVolume(guildID, volume) {
    let guild = findGuild(guildID);
    if (guild && guild.voice && guild.voice.connection && guild.voice.connection.dispatcher) {
        guild.voice.connection.dispatcher.setVolume(volume);
        return true;
    }
    return false;
}

function pause(guildID) {
    let guild = findGuild(guildID);
    if (guild && guild.voice && guild.voice.connection && guild.voice.connection.dispatcher) {
        if (!guild.voice.connection.dispatcher.paused) {
            guild.voice.connection.dispatcher.pause(true);
            return true;
        }
    }
    return false;
}

function resume(guildID) {
    let guild = findGuild(guildID);
    if (guild && guild.voice && guild.voice.connection && guild.voice.connection.dispatcher) {
        if (guild.voice.connection.dispatcher.paused) {
            guild.voice.connection.dispatcher.resume();
            return true;
        }
    }
    return false;
}

function skip(guildID) {
    pause(guildID);
    return handleSongEnd(guildID, true);
}

function playSong(guildID, songID, queued = false) {
    return db.Song.findByPk(songID, {
        include: {
            model: db.Playlist,
            include: {
                model: db.Guild,
                include: db.State
            }
        }
    })
        .then(song => new Promise((resolve, reject) => {
            if (song && song.Playlist.Guild.id === guildID) {
                let guild = findGuild(guildID);
                if (guild && guild.voice && guild.voice.connection) {
                    let stream = audio(song.url, song.source);
                    pause(guildID);
                    guild.voice.connection.play(stream, { volume: song.Playlist.Guild.State.volume })
                        .on("start", () => {
                            let newState = {
                                SongId: song.id,
                                playing: true
                            };
                            if (!queued) {
                                newState.lastNotQueue = song.id
                            }
                            updateGuildState(guildID, newState);
                            resolve(true);
                        })
                        .on("finish", () => handleSongEnd(guildID));
                    return;
                }
            }
            updateGuildState(guildID, {
                SongId: null,
                playing: false,
                lastNotQueue: null
            });
            resolve(false);
        }));
}
