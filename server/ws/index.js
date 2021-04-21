const Socket = require("socket.io");
const listeners = require("./listeners");
const session = require("./middleware/session");
const authCheck = require("./middleware/authCheck");
const guildCheck = require("./middleware/guildCheck");

module.exports = function (server) {
    const ws = Socket(server);

    ws.use(session);
    ws.use(authCheck);
    ws.use(guildCheck);

    listeners(ws);

    return ws;
};
