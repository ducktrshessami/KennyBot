const db = require("../models");
const audio = require("./audio");
const { emitStateUpdate } = require("./state");

module.exports = {
    changeVolume,
    setShuffle,
    setRepeat,
    pause,
    resume,
    skip,
    playUrl,
    playSong,
    playPlaylist,
    shufflePlayPlaylist,
    queueSong,
    dequeueSong,
    clearQueue,
    queueFirst,
    queueLast
};

function findGuild(guildID) {
    return process.bot.guilds.cache.get(guildID);
}

function handleSongEnd(guildID, skip = false) {
    return db.Guild.findByPk(guildID, {
        include: [db.Queue, db.State],
        order: [[db.Queue, "order"]]
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
                return playNextInPlaylist(guildID, skip || Boolean(guild.State.repeat));
            }
        })
        .catch(console.error);
}

function playNextQueue(guildID) {
    return db.Guild.findByPk(guildID, {
        include: db.Queue,
        order: [[db.Queue, "order"]]
    })
        .then(guild => {
            return playSong(guildID, guild.Queues[0].SongId, true)
                .then(() => guild.Queues[0].destroy())
                .then(() => emitStateUpdate(guildID));
        });
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
            else {
                return updateGuildState(guildID, {
                    SongId: null,
                    playing: false,
                    paused: false,
                    lastNotQueue: null
                });
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
            else {
                return updateGuildState(guildID, {
                    SongId: null,
                    playing: false,
                    paused: false,
                    lastNotQueue: null
                });
            }
        });
}

function playPlaylist(guildID, playlistID) {
    return setShuffle(guildID, false)
        .then(() => db.Playlist.findByPk(playlistID, {
            include: db.Song,
            order: [[db.Song, "order"]]
        }))
        .then(playlist => {
            if (playlist.Songs.length) {
                return playSong(guildID, playlist.Songs[0].id);
            }
            else {
                return updateGuildState(guildID, {
                    SongId: null,
                    playing: false,
                    paused: false,
                    lastNotQueue: null
                });
            }
        });
}

function playRandomInCurrentPlaylist(guildID) {
    return findLastNotQueue(guildID)
        .then(lastNotQueue => {
            if (lastNotQueue) {
                return playSong(guildID, pickNewRandomFromList(lastNotQueue.Playlist.Songs, lastNotQueue).id);
            }
            else {
                return updateGuildState(guildID, {
                    SongId: null,
                    playing: false,
                    paused: false,
                    lastNotQueue: null
                });
            }
        })
}

function shufflePlayPlaylist(guildID, playlistID) {
    return setShuffle(guildID, true)
        .then(() => db.Playlist.findByPk(playlistID, {
            include: db.Song,
            order: [[db.Song, "order"]]
        }))
        .then(playlist => pickNewRandomFromList(playlist.Songs))
        .then(song => {
            if (song) {
                return playSong(guildID, song.id);
            }
            else {
                return updateGuildState(guildID, {
                    SongId: null,
                    playing: false,
                    paused: false,
                    lastNotQueue: null
                });
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
        .then(guild => {
            if (guild) {
                return guild.State.update(stateData);
            }
        })
        .then(() => emitStateUpdate(guildID));
}

function changeVolume(guildID, volume) {
    let vol = Math.max(0, Math.min(1.5, volume));
    return db.Guild.findByPk(guildID, { include: db.State })
        .then(guild => {
            if (guild) {
                return guild.State.update({ volume: vol });
            }
        }).then(() => {
            let guild = findGuild(guildID);
            if (guild && guild.voice && guild.voice.connection && guild.voice.connection.dispatcher) {
                guild.voice.connection.dispatcher.setVolume(vol);
            }
        })
        .then(() => emitStateUpdate(guildID));
}

function setShuffle(guildID, shuffle) {
    return db.Guild.findByPk(guildID, { include: db.State })
        .then(guild => {
            if (guild) {
                return guild.State.update({ shuffle });
            }
        })
        .then(() => emitStateUpdate(guildID));
}

function setRepeat(guildID, repeat) {
    return db.Guild.findByPk(guildID, { include: db.State })
        .then(guild => {
            if (guild) {
                return guild.State.update({ repeat });
            }
        })
        .then(() => emitStateUpdate(guildID));
}

function pause(guildID) {
    let guild = findGuild(guildID);
    if (guild && guild.voice && guild.voice.connection && guild.voice.connection.dispatcher) {
        if (!guild.voice.connection.dispatcher.paused) {
            guild.voice.connection.dispatcher.pause(true);
            updateGuildState(guildID, { paused: true });
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
            updateGuildState(guildID, { paused: false });
            return true;
        }
    }
    return false;
}

function skip(guildID) {
    stopCurrentSong(guildID);
    return handleSongEnd(guildID, true);
}

function playUrl(guildID, url) {
    return db.Guild.findByPk(guildID, { include: db.State })
        .then(dbGuild => new Promise((resolve, reject) => {
            if (dbGuild) {
                let source = audio.getSource(url);
                let guild = findGuild(guildID);
                if (source && guild && guild.voice && guild.voice.connection) {
                    let stream = audio(url, source);
                    guild.voice.connection.play(stream, { volume: dbGuild.State.volume })
                        .on("start", () => {
                            updateGuildState(guildID, {
                                SongId: null,
                                playing: true
                            });
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
                    guild.voice.connection.play(stream, { volume: song.Playlist.Guild.State.volume })
                        .on("start", () => {
                            let newState = {
                                SongId: song.id,
                                playing: true,
                                paused: false
                            };
                            if (!queued) {
                                newState.lastNotQueue = song.id
                            }
                            updateGuildState(guildID, newState)
                                .then(() => resolve(true))
                                .catch(reject);
                        })
                        .on("finish", () => handleSongEnd(guildID));
                    return;
                }
            }
            updateGuildState(guildID, {
                SongId: null,
                playing: false,
                paused: false,
                lastNotQueue: null
            })
                .then(() => resolve(false))
                .catch(reject);
        }));
}

function queueSong(guildID, songID) {
    return db.Song.findByPk(songID, {
        include: [db.Playlist, db.Queue]
    })
        .then(song => {
            if (song && !song.Queue && song.Playlist.GuildId === guildID) {
                return db.Queue.findAll({
                    where: { GuildId: guildID },
                    order: [["order"]]
                })
                    .then(queues => db.Queue.create({
                        GuildId: guildID,
                        SongId: songID,
                        order: queues && queues[queues.length - 1] ? queues[queues.length - 1].order + 1 : 0
                    }))
                    .then(() => emitStateUpdate(guildID));
            }
        });
}

function dequeueSong(guildID, queueID) {
    return db.Queue.findByPk(queueID)
        .then(queue => {
            if (queue && queue.GuildId === guildID) {
                return queue.destroy()
                    .then(() => queueFirst(guildID))
                    .then(() => emitStateUpdate(guildID));
            }
        });
}

function clearQueue(guildID) {
    return db.Queue.destroy({
        where: { GuildId: guildID }
    })
        .then(() => emitStateUpdate(guildID));
}

function queueFirst(guildID, queues = []) {
    return db.Queue.findAll({
        where: { GuildId: guildID },
        order: [["order"]]
    })
        .then(current => queues.concat(current.filter(queue => !queues.includes(queue.id))
            .map(queue => queue.id)))
        .then(queueAll);
}

function queueLast(guildID, queues = []) {
    return db.Queue.findAll({
        where: { GuildId: guildID },
        order: [["order"]]
    })
        .then(current => current.filter(queue => !queues.includes(queue.id))
            .map(queue => queue.id)
            .concat(queues))
        .then(queueAll);
}

function queueAll(guildID, queues) {
    return Promise.all(queues.map((id, i) => db.Queue.update({ order: i }, {
        where: { id }
    })))
        .then(() => emitStateUpdate(guildID));
}

function stopCurrentSong(guildID) {
    let guild = findGuild(guildID);
    if (guild && guild.voice && guild.voice.connection && guild.voice.connection.dispatcher) {
        guild.voice.connection.dispatcher.destroy();
    }
}
