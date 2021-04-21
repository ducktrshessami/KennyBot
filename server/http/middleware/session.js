const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const middleware = session({
    secret: process.env.API_SECRET,
    store: new MemoryStore({ checkPeriod: 86400000 }),
    resave: true,
    saveUninitialized: true
});

module.exports = middleware;
