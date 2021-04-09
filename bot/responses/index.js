const path = require("path");

const priority = [
    "default"
];

module.exports =
    priority
        .map(file => require(path.join(__dirname, file + ".js")));
