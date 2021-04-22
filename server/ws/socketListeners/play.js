const music = require("../../../utils/music");

module.exports = function (socket) {
    socket.on("playlistPlay", function (playlistID) {
        music.playPlaylist(socket.handshake.auth.guildID, playlistID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("playlistShuffle", function (playlistID) {
        music.shufflePlayPlaylist(socket.handshake.auth.guildID, playlistID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("songPlay", function (songID) {
        music.playSong(socket.handshake.auth.guildID, songID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });
};
