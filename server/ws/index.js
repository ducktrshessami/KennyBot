const Socket = require("socket.io");
const socketListeners = require("./socketListeners");
const session = require("./middleware/session");
const authCheck = require("./middleware/authCheck");
const guildCheck = require("./middleware/guildCheck");
const { getNewState } = require("../../utils/state");

module.exports = function (server) {
    const ws = Socket(server);

    ws.use(session);
    ws.use(authCheck);
    ws.use(guildCheck);

    ws.on("connection", function (socket) {
        socket.join(socket.handshake.auth.guildID);
        getNewState(socket.handshake.auth.guildID)
            .then(state => socket.emit("stateInitial", state))
            .catch(err => {
                console.error(err);
                socket.emit("error", "Failed to get initial state");
            });
        socketListeners(socket);
    });

    return ws;
};
