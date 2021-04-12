const API_ORIGIN = "https://discord-kennybot.herokuapp.com";

const API = {
    ORIGIN: API_ORIGIN,
    getUser,
    getUserGuilds
};

function resJSON(res) {
    if (res.status === 200) {
        return res.json();
    }
}

function getUser() {
    return fetch(API_ORIGIN + "/api/user")
        .then(resJSON);
}

function getUserGuilds() {
    return fetch(API_ORIGIN + "/api/user/guilds")
        .then(resJSON);
}

export default API;
