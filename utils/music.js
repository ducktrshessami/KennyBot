module.exports = {
    changeVolume
};

function findGuild(guildID) {
    return process.bot.guilds.cache.get(guildID);
}

function changeVolume(guildID, volume) {
    let guild = findGuild(guildID);
    if (guild && guild.voice.connection && guild.voice.connection.dispatcher) {
        guild.voice.connection.dispatcher.setVolume(volume);
    }
}
