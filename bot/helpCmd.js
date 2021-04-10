const { Command, utils } = require("discord-bot");
const { MessageEmbed } = require("discord.js");
const config = require("../config/bot.json");

const pageTemplates = {
    General: [
        "invite",
        "poll",
        "prune",
        "prefix"
    ],
    Dice: [
        "advantage",
        "disadvantage",
        "exploding",
        "roll",
        "stat",
        "stats"
    ],
    Music: [
        "join",
        "leave",
        "volume"
    ]
};

module.exports = function (commandList) {
    for (let section in pageTemplates) {
        pageTemplates[section].sort();
    }

    const pages = Object.keys(pageTemplates)
        .map(template => ({
            options: new MessageEmbed({
                title: `${template} Commands:`,
                description: pageTemplates[template]
                    .map(cmdName => {
                        let target = commandList.find(command => command.name.toLowerCase() === cmdName.toLowerCase());
                        if (target) {
                            return `**${target.name}:** ${target.description}`;
                        }
                        else {
                            return "";
                        }
                    })
                    .filter(line => line)
                    .join("\n")
            })
        }));

    return new Command("help", function (message, args) {
        utils.sendPages(message.channel, pages, config.cmdOptions.help.ms)
            .catch(console.error);
    });
};
