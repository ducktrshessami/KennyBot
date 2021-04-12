module.exports = {
    changeVolume,
    pause,
    resume
};

function findGuild(guildID) {
    return process.bot.guilds.cache.get(guildID);
}

function changeVolume(guildID, volume) {
    let guild = findGuild(guildID);
    if (guild && guild.voice.connection && guild.voice.connection.dispatcher) {
        guild.voice.connection.dispatcher.setVolume(volume);
        return true;
    }
    return false;
}

function pause(guildID) {
    let guild = findGuild(guildID);
    if (guild && guild.voice.connection && guild.voice.connection.dispatcher) {
        if (!guild.voice.connection.dispatcher.paused) {
            guild.voice.connection.dispatcher.pause(true);
            return true;
        }
    }
    return false;
}

function resume(guildID) {
    let guild = findGuild(guildID);
    if (guild && guild.voice.connection && guild.voice.connection.dispatcher) {
        if (guild.voice.connection.dispatcher.paused) {
            guild.voice.connection.dispatcher.resume();
            return true;
        }
    }
    return false;
}
