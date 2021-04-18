const API = {
    gotoLogin,
    gotoLogout,
    getUser,
    getUserGuilds,
    getGuildInfo,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    playSong
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

function updatePlaylist(guildId, playlistId, playlistData) {
    return fetch(`/api/guild/playlist/${guildId}/${playlistId}`, {
        method: "put",
        body: JSON.stringify(playlistData),
        headers: { "Content-Type": "application/json" }
    })
        .then(resJSON);
}

function deletePlaylist(guildId, playlistId) {
    return fetch(`/api/guild/playlist/${guildId}/${playlistId}`, { method: "delete" });
}

function playSong(guildId, songId) {
    return fetch(`/api/play/${guildId}/${songId}`, { method: "post" });
}

export default API;
