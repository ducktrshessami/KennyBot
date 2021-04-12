const API = {
    gotoLogin,
    gotoLogout,
    getUser,
    getUserGuilds
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

export default API;
