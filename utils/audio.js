const ytdl = require("ytdl-core");
const scdl = require("scdl-core");
const config = require("../config/audio.json");

module.exports = controller;
module.exports.getSource = getSource;

scdl.setClientID(process.env.SCDL_CLIENTID || config.scdl.client_id);
scdl.setOauthToken(process.env.SCDL_TOKEN || config.scdl.oauth_token);

function controller(url, source) {
    let stream;
    switch (source) {
        case "youtube": stream = youtube(url); break;
        case "soundcloud": stream = soundcloud(url); break;
        default:
    }
    stream.on("error", console.error);
    return stream;
}

function youtube(url) {
    return ytdl(url, config.ytdl.options);
}

function soundcloud(url) {
    return scdl(url);
}

function getSource(url) {
    if (ytdl.validateURL(url)) {
        return "youtube";
    }
    else if (scdl.validateURL(url)) {
        return "soundcloud";
    }
}
