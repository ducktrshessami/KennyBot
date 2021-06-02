const fs = require("fs");
const path = require("path");

module.exports =
    fs
        .readdirSync(__dirname)
        .filter(file => (
            (file.indexOf('.') !== 0) &&
            (file !== path.basename(__filename)) &&
            (file.slice(-5) === ".json")
        ))
        .map(file => require(path.join(__dirname, file)));
