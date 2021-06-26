const db = require("../models");
const audio = require("./audio");
const state = require("./state");
const audit = require("./audit");
const config = require("../config/audio.json");

let streamTimeout = {};

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
    dequeueSongBulk,
    clearQueue,
    queueFirst,
    queueLast,
    resetOrder,
    resetOrderAll,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addSong,
    deleteSong,
    importPlaylist
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
            if (!skip && guild.State.repeat === 1) {
                return playSong(guildID, guild.State.SongId, true);
            }
            else if (guild.Queues.length) {
                return playNextQueue(guildID);
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
                .then(() => state.emitStateUpdate(guildID));
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

function playPlaylist(guildID, playlistID, userID) {
    return setShuffle(guildID, false)
        .then(() => db.Playlist.findByPk(playlistID, {
            include: db.Song,
            order: [[db.Song, "order"]]
        }))
        .then(playlist => {
            if (playlist.Songs.length) {
                return playSong(guildID, playlist.Songs[0].id)
                    .then(() => {
                        if (userID) {
                            return audit.log(userID, guildID, 7, [playlist.name]);
                        }
                    });
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

function shufflePlayPlaylist(guildID, playlistID, userID) {
    return setShuffle(guildID, true)
        .then(() => db.Playlist.findByPk(playlistID, {
            include: db.Song,
            order: [[db.Song, "order"]]
        }))
        .then(playlist => {
            let song = pickNewRandomFromList(playlist.Songs);
            if (song) {
                return playSong(guildID, song.id)
                    .then(() => {
                        if (userID) {
                            return audit.log(userID, guildID, 8, [playlist.name]);
                        }
                    });
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
        .then(() => state.emitStateUpdate(guildID));
}

function changeVolume(guildID, volume, userID) {
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
        .then(() => state.emitStateUpdate(guildID))
        .then(() => {
            if (userID) {
                return audit.log(userID, guildID, 3, [vol]);
            }
        });
}

function setShuffle(guildID, shuffle, userID) {
    return db.Guild.findByPk(guildID, { include: db.State })
        .then(guild => {
            if (guild) {
                return guild.State.update({ shuffle });
            }
        })
        .then(() => state.emitStateUpdate(guildID))
        .then(() => {
            if (userID) {
                return audit.log(userID, guildID, 4, [shuffle ? "on" : "off"]);
            }
        });
}

function setRepeat(guildID, repeat, userID) {
    return db.Guild.findByPk(guildID, { include: db.State })
        .then(guild => {
            if (guild) {
                return guild.State.update({ repeat });
            }
        })
        .then(() => state.emitStateUpdate(guildID))
        .then(() => {
            if (userID) {
                return audit.log(userID, guildID, 5, [repeat]);
            }
        });
}

function pause(guildID, userID) {
    let guild = findGuild(guildID);
    if (guild && guild.voice && guild.voice.connection && guild.voice.connection.dispatcher) {
        if (!guild.voice.connection.dispatcher.paused) {
            guild.voice.connection.dispatcher.pause(true);
            updateGuildState(guildID, { paused: true })
                .catch(console.error);
            if (userID) {
                state.getNewState(guildID)
                    .then(guildState => audit.log(userID, guildID, 0, [guildState.song.title]))
                    .catch(console.error);
            }
            return true;
        }
    }
    return false;
}

function resume(guildID, userID) {
    let guild = findGuild(guildID);
    if (guild && guild.voice && guild.voice.connection && guild.voice.connection.dispatcher) {
        if (guild.voice.connection.dispatcher.paused) {
            guild.voice.connection.dispatcher.resume();
            updateGuildState(guildID, { paused: false })
                .catch(console.error);
            if (userID) {
                state.getNewState(guildID)
                    .then(guildState => audit.log(userID, guildID, 1, [guildState.song.title]))
                    .catch(console.error);
            }
            return true;
        }
    }
    return false;
}

async function skip(guildID, userID) {
    stopCurrentSong(guildID);
    if (userID) {
        audit.log(userID, guildID, 2, [(await state.getNewState(guildID)).song.title]);
    }
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
                    let timeout = idleTimeout(() => {
                        handleSongEnd(guildID)
                            .catch(console.error);
                    }, config.streamTimeout);
                    if (streamTimeout[guildID]) {
                        clearTimeout(streamTimeout[guildID]);
                    }
                    guild.voice.connection.play(stream, { volume: dbGuild.State.volume })
                        .on("start", () => {
                            updateGuildState(guildID, {
                                SongId: null,
                                playing: true
                            })
                                .catch(console.error);
                            resolve(true);
                        })
                        .on("speaking", speaking => {
                            if (speaking) {
                                streamTimeout[guildID] = timeout();
                            }
                        });
                    streamTimeout[guildID] = timeout();
                    return;
                }
            }
            updateGuildState(guildID, {
                SongId: null,
                playing: false,
                lastNotQueue: null
            })
                .catch(console.error);
            resolve(false);
        }));
}

function playSong(guildID, songID, queued = false, userID) {
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
                    let timeout = idleTimeout(() => {
                        handleSongEnd(guildID)
                            .catch(console.error);
                    }, config.streamTimeout);
                    if (streamTimeout[guildID]) {
                        clearTimeout(streamTimeout[guildID]);
                    }
                    guild.voice.connection.play(stream, { volume: song.Playlist.Guild.State.volume })
                        .on("start", () => {
                            let newState = {
                                SongId: song.id,
                                playing: true,
                                paused: false
                            };
                            if (userID) {
                                audit.log(userID, guildID, 6, [song.title])
                                    .catch(console.error);
                            }
                            if (!queued) {
                                newState.lastNotQueue = song.id
                            }
                            updateGuildState(guildID, newState)
                                .then(() => resolve(true))
                                .catch(reject);
                        })
                        .on("speaking", speaking => {
                            if (speaking) {
                                streamTimeout[guildID] = timeout();
                            }
                        });
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

function queueSong(guildID, songID, userID) {
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
                    .then(() => state.emitStateUpdate(guildID))
                    .then(() => {
                        if (userID) {
                            return audit.log(userID, guildID, 9, [song.title]);
                        }
                    });
            }
        });
}

function dequeueSong(guildID, queueID, userID) {
    return db.Queue.findByPk(queueID, { include: db.Song })
        .then(queue => {
            if (queue && queue.GuildId === guildID) {
                return queue.destroy()
                    .then(() => queueFirst(guildID))
                    .then(() => state.emitStateUpdate(guildID))
                    .then(() => {
                        if (userID) {
                            return audit.log(userID, guildID, 10, [queue.Song.title]);
                        }
                    });
            }
        });
}

function dequeueSongBulk(guildID, idList, userID) {
    let titles = [];
    return Promise.all(idList.map(queueID => db.Queue.findByPk(queueID, { include: db.Song })
        .then(queue => {
            if (queue && queue.GuildId === guildID) {
                titles.push(queue.Song.title);
                return queue.destroy();
            }
        })))
        .then(() => queueFirst(guildID))
        .then(() => state.emitStateUpdate(guildID))
        .then(() => {
            if (userID) {
                return audit.log(userID, guildID, 10, titles);
            }
        });
}

function clearQueue(guildID) {
    return db.Queue.destroy({
        where: { GuildId: guildID }
    })
        .then(() => state.emitStateUpdate(guildID));
}

function queueFirst(guildID, queues = []) {
    return db.Queue.findAll({
        where: { GuildId: guildID },
        order: [["order"]]
    })
        .then(current => queues.concat(current.filter(queue => !queues.includes(queue.id))
            .map(queue => queue.id)))
        .then(finalOrder => queueAll(guildID, finalOrder));
}

function queueLast(guildID, queues = []) {
    return db.Queue.findAll({
        where: { GuildId: guildID },
        order: [["order"]]
    })
        .then(current => current.filter(queue => !queues.includes(queue.id))
            .map(queue => queue.id)
            .concat(queues))
        .then(finalOrder => queueAll(guildID, finalOrder));
}

function queueAll(guildID, queues) {
    return Promise.all(queues.map((id, i) => db.Queue.update({ order: i }, {
        where: { id }
    })))
        .then(() => state.emitStateUpdate(guildID));
}

function stopCurrentSong(guildID) {
    let guild = findGuild(guildID);
    if (guild && guild.voice && guild.voice.connection && guild.voice.connection.dispatcher) {
        guild.voice.connection.dispatcher.destroy();
    }
}

function idleTimeout(callback, ms) {
    let foo;
    return () => {
        if (foo) {
            clearTimeout(foo);
        }
        return foo = setTimeout(callback, ms);
    };
}

function resetOrder(guildID, playlistID) {
    return db.Playlist.findByPk(playlistID, { include: db.Song })
        .then(playlist => {
            if (playlist && playlist.GuildId === guildID) {
                return Promise.all(playlist.Songs.map((song, i) => song.update({ order: i })));
            }
        });
}

function resetOrderAll(guildID) {
    return db.Guild.findByPk(guildID, { include: db.Playlist })
        .then(guild => {
            if (guild) {
                return Promise.all(guild.Playlists.map(playlist => resetOrder(guildID, playlist.id)));
            }
        });
}

function createPlaylist(guildID, playlistName, userID) {
    return db.Playlist.create({
        name: playlistName,
        GuildId: guildID
    })
        .then(playlist => Promise.all([
            audit.log(userID, guildID, 11, [playlist.name]),
            state.emitStateUpdate(guildID)
        ])
            .then(() => playlist));
}

function renamePlaylist(guildID, playlistID, newName, userID) {
    return db.Playlist.findByPk(playlistID)
        .then(playlist => {
            if (playlist && playlist.GuildId === guildID) {
                let oldName = playlist.name;
                return playlist.update({ name: newName })
                    .then(updated => Promise.all([
                        audit.log(userID, guildID, 12, [oldName, updated.name]),
                        state.emitStateUpdate(guildID)
                    ])
                        .then(() => updated))
            }
        });
}

function deletePlaylist(guildID, playlistID, userID) {
    return db.Playlist.findByPk(playlistID)
        .then(playlist => {
            if (playlist && playlist.GuildId === guildID) {
                return playlist.destroy()
                    .then(() => Promise.all([
                        audit.log(userID, guildID, 13, [playlist.name]),
                        state.emitStateUpdate(guildID)
                    ]));
            }
        });
}

function addSong(guildID, playlistID, url, userID) {
    return db.Playlist.findByPk(playlistID, {
        include: db.Song,
        order: [[db.Song, "order"]]
    })
        .then(playlist => {
            if (playlist && playlist.GuildId === guildID) {
                let lastSong = playlist.Songs[playlist.Songs.length - 1];
                return audio.getTitle(url)
                    .then(title => db.Song.create({
                        title,
                        url: audio.formatUrl(url),
                        source: audio.getSource(url),
                        order: lastSong ? lastSong.order + 1 : 0,
                        PlaylistId: playlistID
                    }))
                    .then(song => Promise.all([
                        audit.log(userID, guildID, 14, [playlist.name, song.title]),
                        state.emitStateUpdate(guildID)
                    ])
                        .then(() => song));
            }
        });
}

function deleteSong(guildID, songID, userID) {
    return db.Song.findByPk(songID, { include: db.Playlist })
        .then(song => {
            if (song && song.Playlist.GuildId === guildID) {
                return song.destroy()
                    .then(() => Promise.all([
                        audit.log(userID, guildID, 15, [song.Playlist.name, song.title]),
                        state.emitStateUpdate(guildID)
                    ]));
            }
        });
}

function importPlaylist(guildID, playlistID, url, userID) {
    return db.Playlist.findByPk(playlistID, {
        include: db.Song,
        order: [[db.Song, "order"]]
    })
        .then(playlist => {
            if (playlist && playlist.GuildId === guildID) {
                let titles;
                let lastSong = playlist.Songs[playlist.Songs.length - 1];
                let lastOrder = lastSong ? lastSong.order + 1 : 0;
                return audio.parsePlaylist(url)
                    .then(tracks => {
                        titles = tracks.map(track => track.title);
                        return Promise.all(tracks.map((track, i) => db.Song.create({
                            ...track,
                            order: lastOrder + i,
                            PlaylistId: playlistID
                        })));
                    })
                    .then(() => Promise.all([
                        audit.log(userID, guildID, 14, [playlist.name, ...titles]),
                        state.emitStateUpdate(guildID)
                    ]));
            }
        })
}
