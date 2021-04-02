const express = require("express");
const Cycle = require("express-cycle");
const { resolve } = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const cycler = Cycle({
    origin: process.env.API_ORIGIN || `http://localhost:${PORT}`,
    ms: 1500000,
    verbose: true
});

app.use(cycler);
app.use(require("./routes"));
app.use(express.static(resolve(__dirname, "public")));

app.get("*", function (req, res) {
    res.redirect("/");
});

module.exports = app.listen(PORT, function () {
    console.log(`API listening on PORT ${PORT}`);
    cycler.startLoop();
});
