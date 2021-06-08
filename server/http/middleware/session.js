const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const db = require("../../../models");

const store = new SequelizeStore({
    db: db.sequelize,
    checkExpirationInterval: Number(process.env.SESSION_CHECK) || 86400000
});
const middleware = session({
    secret: process.env.SESSION_SECRET,
    store: store,
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: { maxAge: Number(process.env.SESSION_LIFE) || 604800000 }
});

store.sync({ force: process.env.DB_FORCE && process.env.DB_FORCE.trim().toLowerCase() !== "false" })
    .catch(console.error);

module.exports = middleware;
