module.exports = {
    changeVolume
};

function findGuild(client, guildID) {
    return client.guilds.cache.get(guildID);
}

function changeVolume(client, guildID, volume) {
    let guild = findGuild(client, guildID);
    if (guild && guild.voice.connection && guild.voice.connection.dispatcher) {
        guild.voice.connection.dispatcher.setVolume(volume);
    }
}
