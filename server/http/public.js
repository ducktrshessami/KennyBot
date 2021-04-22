const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const staticDir = path.resolve(__dirname, "..", "..", "client", "build");
const staticIndex = path.join(staticDir, "index.html");

if (fs.existsSync(staticDir)) {
    router.use(express.static(staticDir));

    router.get("*", function (req, res) {
        res.status(200).sendFile(staticIndex);
    });
}

module.exports = router;
