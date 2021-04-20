const express = require("express");
const Cycle = require("express-cycle");
const auth = require("./middleware/auth");

const cycler = Cycle({
    origin: process.env.API_ORIGIN,
    ms: 1500000,
    verbose: true
});

module.exports = function (session) {
    const app = express();
    app.use(cycler);
    app.use(session);
    app.use(auth.init);
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(require("./routes"));
    app.use(require("./public"));
    return app;
};

module.exports.cycler = cycler;
