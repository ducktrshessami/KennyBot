const config = require("../../config/audio.json");

const timeouts = {};

function createChannelTimeout(guildID) {
    return setTimeout(() => {
        let voiceState = process.bot.guilds.cache.get(guildID).voice;
        if (voiceState) {
            voiceState.connection.disconnect();
        }
    }, config.idleTimeout);
}

async function handleIdle(before, after) {
    let channel = after.channel || before.channel;
    clearTimeout(timeouts[after.guild.id]);
    delete timeouts[after.guild.id];
    if (channel && channel.members.get(process.bot.user.id) && channel.members.size === 1) {
        timeouts[after.guild.id] = createChannelTimeout(after.guild.id);
    }
}

module.exports = handleIdle;
