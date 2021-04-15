const API = {
    gotoLogin,
    gotoLogout,
    getUser,
    getUserGuilds,
    getGuildInfo,
    createPlaylist
};

function gotoLogin() {
    window.location.replace("/api/login");
}

function gotoLogout() {
    window.location.replace("/api/logout");
}

function resJSON(res) {
    if (res.status === 200) {
        return res.json();
    }
}

function getUser() {
    return fetch("/api/user")
        .then(resJSON);
}

function getUserGuilds() {
    return fetch("/api/user/guilds")
        .then(resJSON);
}

function getGuildInfo(id) {
    return fetch(`/api/guild/${id}`)
        .then(resJSON);
}

function createPlaylist(guildId, playlistName) {
    return fetch(`/api/guild/playlist/${guildId}`, {
        method: "post",
        body: `{"name": "${playlistName}"}`,
        headers: { "Content-Type": "application/json" }
    })
        .then(resJSON);
}

export default API;
