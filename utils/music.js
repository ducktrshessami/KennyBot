const db = require("../models");
const audio = require("./audioController");

module.exports = {
    changeVolume,
    pause,
    resume,
    playSong
};

function findGuild(guildID) {
    return process.bot.guilds.cache.get(guildID);
}

function handleSongEnd(guildID) {
    db.Guild.findByPk(guildID, {
        include: {
            model: db.State,
            include: {
                model: db.Song,
                include: db.Playlist
            }
        }
    });
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

function playSong(guildID, songID) {
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
                            updateGuildState(guildID, {
                                SongId: song.id,
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
                playing: false
            });
            resolve(false);
        }));
}
