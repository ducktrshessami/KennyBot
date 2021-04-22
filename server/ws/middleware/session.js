const session = require("../../http/middleware/session");

module.exports = function (socket, next) {
    session(socket.request, socket.request.res || {}, next);
};
