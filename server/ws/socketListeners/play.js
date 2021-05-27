const music = require("../../../utils/music");

module.exports = function (socket) {
    socket.on("playlistPlay", function (playlistID) {
        music.playPlaylist(socket.handshake.auth.guildID, playlistID, socket.handshake.auth.userID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("playlistShuffle", function (playlistID) {
        music.shufflePlayPlaylist(socket.handshake.auth.guildID, playlistID, socket.handshake.auth.userID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("songPlay", function (songID) {
        music.playSong(socket.handshake.auth.guildID, songID, false, socket.handshake.auth.userID)
            .catch(err => {
                console.error(err);
                socket.emit("error", err);
            });
    });

    socket.on("pauseChange", function (paused) {
        let result;
        if (paused) {
            result = music.pause(socket.handshake.auth.guildID, socket.handshake.auth.userID);
        }
        else {
            result = music.resume(socket.handshake.auth.guildID, socket.handshake.auth.userID);
        }
        if (!result) {
            socket.emit("error", new Error(`Failed to ${paused ? "pause" : "resume"}`));
        }
    });

    socket.on("playNext", function () {
        music.skip(socket.handshake.auth.guildID);
    });
};
