const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;

module.exports = app.listen(PORT, function () {
    console.log(`API listening on PORT ${PORT}`);
});
