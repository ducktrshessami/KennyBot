const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const scdl = require("scdl-core");
const { fetchKey } = require("soundcloud-key-fetch");
const config = require("../config/audio.json");

const SCDL_CLIENT = process.env.SCDL_CLIENTID || config.scdl.client_id;

module.exports = controller;
module.exports.getSource = getSource;
module.exports.getTitle = getTitle;
module.exports.formatUrl = formatUrl;
module.exports.parsePlaylist = parsePlaylist;
module.exports.getPlaylistSource = getPlaylistSource;

scdl.setOauthToken(process.env.SCDL_TOKEN || config.scdl.oauth_token);
if (SCDL_CLIENT) {
    scdl.setClientID(SCDL_CLIENT);
}
else {
    fetchKey()
        .then(client_id => scdl.setClientID(client_id))
        .catch(console.error);
}

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
    if (url) {
        if (ytdl.validateURL(url)) {
            return "youtube";
        }
        else if (scdl.validateURL(url)) {
            return "soundcloud";
        }
    }
}

async function getPlaylistSource(url) {
    if (url) {
        try {
            await ytpl.getPlaylistID(url);
            return "youtube";
        }
        catch {
            if (scdl.playlist.validateURL(url)) {
                return "soundcloud";
            }
        }
    }
}

function getTitle(url) {
    return new Promise((resolve, reject) => {
        let source = getSource(url);
        switch (source) {
            case "youtube":
                ytdl.getBasicInfo(url)
                    .then(res => res.videoDetails.title)
                    .then(resolve);
                break;
            case "soundcloud":
                scdl.getInfo(url)
                    .then(res => `${res.user.username} - ${res.title}`)
                    .then(resolve);
                break;
            default:
                reject(new Error("Source not supported"));
        }
    });
}

function formatUrl(url) {
    let source = getSource(url);
    switch (source) {
        case "youtube": return `https://youtube.com/watch?v=${ytdl.getURLVideoID(url)}`;
        case "soundcloud": return scdl.getPermalinkURL(url);
        default:
    }
}

function parsePlaylist(url) {
    return getPlaylistSource(url)
        .then(source => {
            switch (source) {
                case "youtube": return parseYoutube(url);
                case "soundcloud": return parseSoundcloud(url);
                default:
            }
        });
}

function parseYoutube(url) {
    return ytpl.getPlaylistID(url)
        .then(id => ytpl(id, { limit: Infinity }))
        .then(res => {
            if (res.items) {
                return res.items.map(item => ({
                    title: item.title,
                    url: `https://youtube.com/watch?v=${item.id}`,
                    source: "youtube"
                }));
            }
            else {
                return [];
            }
        });
}

function parseSoundcloud(url) {
    return scdl.playlist.getInfo(url)
        .then(info => {
            if (info.tracks) {
                return info.tracks.map(track => ({
                    title: `${track.user.username} - ${track.title}`,
                    url: track.permalink_url,
                    source: "soundcloud"
                }));
            }
            else {
                return [];
            }
        });
}
