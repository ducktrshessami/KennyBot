module.exports = function (socket) {
    socket.on("songQueue", function (songID) {
        music.queueSong(socket.handshake.auth.guildID, songID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });
};
