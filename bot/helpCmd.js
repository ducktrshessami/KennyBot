const { Command, utils } = require("discord-bot");
const { MessageEmbed } = require("discord.js");
const config = require("../config/bot.json");

const pageTemplates = {
    General: [
        "poll",
        "prune",
        "prefix",
        "help",
        "audit",
        "invite",
        "toggleresponses"
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
        "volume",
        "pause",
        "resume",
        "play",
        "skip",
        "player"
    ]
};

module.exports = function (commandList) {
    let pages;
    // Add help command to the end of the list
    commandList.push(new Command("help", function (message, args) {
        // Searching for specific command help
        if (args[1]) {
            let target = commandList.find(command => command.name.toLowerCase() === args[1].toLowerCase());
            if (target) {
                utils.sendVerbose(message.channel, [
                    message.author.toString(),
                    `\`${target.usage}\``,
                    target.description,
                    target.subtitle
                ]
                    .filter(line => line) // Filter empty lines
                    .join("\n")
                )
                    .catch(console.error);
            }
            else {
                utils.sendVerbose(message.channel, `Could not find command \`${args[1]}\``)
                    .catch(console.error);
            }
        }
        // Command list
        else {
            utils.sendPages(message.channel, pages, config.cmdOptions.help.ms)
                .catch(console.error);
        }
    }, {
        usage: "@kennybot help [command]",
        description: "Display a command list or a specific command's info"
    }));

    // Generate command list embeds
    pages = Object.keys(pageTemplates)
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
                    .sort()
                    .join("\n"),
                color: config.embedColor || "RANDOM"
            })
        }));
};
