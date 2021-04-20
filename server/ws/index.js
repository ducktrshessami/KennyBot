const socket = require("socket.io");

module.exports = function(server) {
    const ws = socket(server);
};
