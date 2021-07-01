const fs = require("fs");
const path = require("path");

const bottom = [
    "default"
];

module.exports =
    fs
        .readdirSync(__dirname)
        .filter(file => (
            (file.indexOf('.') !== 0) &&
            (file !== path.basename(__filename)) &&
            (file.slice(-3) === '.js') &&
            (!bottom.includes(file.slice(0, -3)))
        ))
        .concat(bottom.map(file => file + ".js"))
        .map(file => require(path.join(__dirname, file)));
