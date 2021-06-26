const { utils } = require("discord-bot");
const { MessageEmbed } = require("discord.js");
const db = require("../../models");
const config = require("../../config/bot.json");

module.exports = function (guildID, user, content) {
    return db.Guild.findByPk(guildID)
        .then(guild => {
            if (guild.auditChannel) {
                let channel = process.bot.channels.cache.get(guild.auditChannel);
                if (channel) {
                    return utils.sendVerbose(channel, new MessageEmbed({
                        color: config.embedColor || "RANDOM",
                        author: {
                            name: `${user.username}#${user.discriminator}`,
                            iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                        },
                        description: content,
                        footer: { text: `User ID: ${user.id}` }
                    }));
                }
                else {
                    return guild.update({ auditChannel: null });
                }
            }
        });
};
