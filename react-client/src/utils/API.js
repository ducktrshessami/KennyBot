const API = {
    gotoLogin,
    gotoLogout,
    getUser,
    getUserGuilds,
    getGuildInfo
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

export default API;
