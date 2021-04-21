const Socket = require("socket.io");
const auth = require("./middleware/auth");
const session = require("../http/middleware/session");
const expressAuth = require("../http/middleware/auth");
const wrapExpressMiddleware = require("./utils/wrapExpressMiddleware");

module.exports = function (server) {
    const ws = Socket(server);

    ws.use(wrapExpressMiddleware(session));
    ws.use(wrapExpressMiddleware(expressAuth.authCheck));
    ws.use(auth);

    ws.on("connection", function (socket) {
        socket.join(socket.handshake.auth.guildID);
        console.log(`Joined ${socket.handshake.auth.guildID}`);
    });

    return ws;
};
