const socket = require("socket.io");

module.exports = function (server, session) {
    const ws = socket(server);

    ws.use(session);

    return ws;
};
