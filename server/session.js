const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const express = session({
    secret: process.env.API_SECRET,
    store: new MemoryStore({ checkPeriod: 86400000 }),
    resave: true,
    saveUninitialized: true
});

const socket = function (socket, next) {
    express(socket.request, socket.request.res || {}, next);
};

module.exports = express;
module.exports.socket = socket;
