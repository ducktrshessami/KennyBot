const music = require("../../../utils/music");

module.exports = function (socket) {
    socket.on("volumeChange", function (volume) {
        music.changeVolume(socket.handshake.auth.guildID, volume)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("shuffleChange", function (shuffle) {
        music.setShuffle(socket.handshake.auth.guildID, shuffle)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });
};
