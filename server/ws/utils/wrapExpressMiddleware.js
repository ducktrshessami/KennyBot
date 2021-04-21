module.exports = function (middleware) {
    return function (socket, next) {
        middleware(socket.request, socket.request.res || {}, next);
    };
};
