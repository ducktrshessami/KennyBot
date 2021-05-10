const music = require("../../../utils/music");

module.exports = function (socket) {
    socket.on("songQueue", function (songID) {
        music.queueSong(socket.handshake.auth.guildID, songID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("songDequeue", function (songID) {
        music.dequeueSong(socket.handshake.auth.guildID, songID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("queueOrderFirst", function (queues) {
        music.queueFirst(socket.handshake.auth.guildID, queues)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("queueOrderLast", function (queues) {
        music.queueLast(socket.handshake.auth.guildID, queues)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });
};
