module.exports = {
    changeVolume
};

function changeVolume(guild, volume) {
    if (guild.voice.connection && guild.voice.connection.dispatcher) {
        guild.voice.connection.dispatcher.setVolume(volume);
    }
}
