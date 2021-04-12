const path = require("path");

const priority = [
    "bless",
    "crit",
    "fuck",
    "imagine",
    "imagineDragons",
    "left",
    "owo",
    "puy",
    "right",
    "sleep",
    "uwu",
    "yup",
    "default"
];

module.exports =
    priority
        .map(file => require(path.join(__dirname, file + ".js")));
