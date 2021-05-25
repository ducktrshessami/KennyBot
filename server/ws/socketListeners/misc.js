const music = require("../../../utils/music");

module.exports = function (socket) {
    socket.on("volumeChange", function (volume) {
        music.changeVolume(socket.handshake.auth.guildID, volume, socket.handshake.auth.userID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("shuffleChange", function (shuffle) {
        music.setShuffle(socket.handshake.auth.guildID, shuffle, socket.handshake.auth.userID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("repeatChange", function (repeat) {
        music.setRepeat(socket.handshake.auth.guildID, repeat, socket.handshake.auth.userID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });
};
