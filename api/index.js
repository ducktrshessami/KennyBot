const express = require("express");
const Cycle = require("express-cycle");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const discord = require("./utils/discord");

const app = express();
const PORT = process.env.PORT || 3001;
const cycler = Cycle({
    origin: process.env.API_ORIGIN || `http://localhost:${PORT}`,
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
app.use(discord.init);
app.use(require("./routes"));
app.use(require("./public"));

module.exports = app.listen(PORT, function () {
    console.log(`API listening on PORT ${PORT}`);
    cycler.startLoop();
});
