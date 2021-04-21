const getGuildState = require("../../../utils/getGuildState");

module.exports = function (ws) {
    ws.on("connection", function (socket) {
        socket.join(socket.handshake.auth.guildID);
        getGuildState(socket.handshake.auth.guildID)
            .then(state => socket.emit("initial", state))
            .catch(err => {
                console.error(err);
                socket.emit("error", "Failed to get initial state");
            });
    });
};
