const config = require("../../config/audio.json");

const timeouts = {};

function createChannelTimeout(guildID) {
    return setTimeout(() => {

    }, config.idleTimeout);
}

async function handleIdle(before, after) {
    let channel = after.channel || before.channel;
    if (channel && channel.members.get(client.user.id)) {
        clearTimeout(timeouts[after.guild.id]);
        delete timeouts[after.guild.id];
        if (channel.members.size <= 1) {
            timeouts[after.guild.id] = createChannelTimeout(after.guild.id);
        }
    }
}

module.exports = handleIdle;
