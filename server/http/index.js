const express = require("express");
const Cycle = require("express-cycle");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const auth = require("./middleware/auth");

const app = express();
const cycler = Cycle({
    origin: process.env.API_ORIGIN,
    ms: 1500000,
    verbose: true
});

app.use(cycler);
app.use(session({
    secret: process.env.API_SECRET,
    store: new MemoryStore({ checkPeriod: 86400000 }),
    resave: true,
    saveUninitialized: true
}));
app.use(auth.init);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(require("./routes"));
app.use(require("./public"));

module.exports = app;
module.exports.cycler = cycler;
