const ytdl = require("ytdl-core");
const scdl = require("scdl-core");
const config = require("../config/audio.json");

module.exports = controller;

scdl.setClientID(process.env.SCDL_CLIENTID || config.scdl.client_id);

function controller(url, source) {
    let stream;
    switch (source) {
        case "youtube": stream = youtube(url); break;
        case "soundcloud": stream = soundcloud(url); break;
        default:
    }
    return stream;
}

function youtube(url) {
    return ytdl(url, config.ytdl.options);
}

function soundcloud(url) {
    return scdl(url);
}