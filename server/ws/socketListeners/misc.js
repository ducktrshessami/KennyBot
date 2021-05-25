const music = require("../../../utils/music");
const audit = require("../../../utils/audit");

module.exports = function (socket) {
    socket.on("volumeChange", function (volume) {
        music.changeVolume(socket.handshake.auth.guildID, volume)
            .then(() => audit.log(socket.handshake.auth.userID, socket.handshake.auth.guildID, `Changed volume to ${volume}`))
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("shuffleChange", function (shuffle) {
        music.setShuffle(socket.handshake.auth.guildID, shuffle)
            .then(() => audit.log(socket.handshake.auth.userID, socket.handshake.auth.guildID, `Toggled shuffle ${shuffle ? "on" : "off"}`))
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("repeatChange", function (repeat) {
        let actionMessage;
        switch (repeat) {
            case 0: actionMessage = "Turned off repeat"; break;
            case 1: actionMessage = "Turned on repeat one"; break;
            case 2: actionMessage = "Turned on repeat all"; break;
            default:
        }
        if (actionMessage) {
            music.setRepeat(socket.handshake.auth.guildID, repeat)
                .then(() => audit.log(socket.handshake.auth.userID, socket.handshake.auth.guildID, actionMessage))
                .catch(err => {
                    console.error(err);
                    socket.emit("error", err);
                });
        }
    });
};
