const express = require("express");
const Cycle = require("express-cycle");
const session = require("./middleware/session");
const auth = require("./middleware/auth");

const app = express();
const cycler = Cycle({
    origin: process.env.API_ORIGIN,
    ms: 1500000,
    verbose: false
});

app.use(cycler);
app.use(session);
app.use(auth.init);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(require("./routes"));
app.use(require("./public"));

module.exports = app;
module.exports.cycler = cycler;
