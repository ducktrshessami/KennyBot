const Socket = require("socket.io");
const session = require("./middleware/session");
const authCheck = require("./middleware/authCheck");
const guildCheck = require("./middleware/guildCheck");

module.exports = function (server) {
    const ws = Socket(server);

    ws.use(session);
    ws.use(authCheck);
    ws.use(guildCheck);

    ws.on("connection", function (socket) {
        socket.join(socket.handshake.auth.guildID);
        console.log(`Joined ${socket.handshake.auth.guildID}`);
    });

    return ws;
};
