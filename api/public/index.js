const express = require("express");
const path = require("path");

const router = express.Router();
const staticDir = path.resolve(__dirname, "..", "..", "react-client", "build");

router.use(express.static(staticDir));

router.get("*", function (req, res) {
    res.redirect("/");
});

module.exports = router;
