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

    });

    socket.on("songPlay", function (songID) {

    });

    socket.on("songQueue", function (songID) {

    });
};
