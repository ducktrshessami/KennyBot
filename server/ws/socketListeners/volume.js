const { changeVolume } = require("../../../utils/music");

module.exports = function (socket) {
    socket.on("volumeChange", function (volume) {
        changeVolume(socket.handshake.auth.guildID, volume)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });
};
