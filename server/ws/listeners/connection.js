const { getNewState } = require("../../../utils/state");

module.exports = function (ws) {
    ws.on("connection", function (socket) {
        socket.join(socket.handshake.auth.guildID);
        getNewState(socket.handshake.auth.guildID)
            .then(state => socket.emit("stateInitial", state))
            .catch(err => {
                console.error(err);
                socket.emit("error", "Failed to get initial state");
            });
    });
};
