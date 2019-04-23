const Discord = require("discord.js"); // Discord
const jsonfile = require("jsonfile"); // File I/O
const colors = require("colors"); // Colored log
const rollParser = require("roll-parser"); // Dice rolls
const Music = require("./music"); // Music handling
var config = require("../config.json"); // Bot configuration

var client; // Discord client
var music; // Music handling
var cl = new Discord.RichEmbed({ // Embed for k!help command list
	title: "Commands:",
	description: ""
});
const commands = { // Command list
	restart: {
		cmd: restart,
		usage: "`Usage: k!restart`",
		description: "Restarts the bot.",
		subtitle: "Botmin only.",
		botmin: "sup"
	},
	help: {
		cmd: help,
		usage: "`Usage: k!help [command]`",
		description: "Displays a command list or describes a specific command.",
		subtitle: "<> denotes a required parameter, while [] denotes an optional one."
	},
	invite: {
		cmd: invite,
		usage: "`Usage: k!invite`",
		description: "Drops a link to invite KennyBot to other servers."
	},
	prefix: {
		cmd: prefix,
		usage: "`Usage: k!prefix <prefix>`",
		description: "Sets a user defined command prefix.",
		subtitle: "k! and @KennyBot will always work regardless of the user defined prefix."
	},
	prune: {
		cmd: prune,
		usage: "`Usage: k!prune <number> [user]`",
		description: "Deletes up to a given number of messages.",
		subtitle: "The deleted messages can be filtered to a specified user.\nDiscord only allows up to 100 messages to be deleted at a time."
	},
	roll: {
		cmd: roll,
		usage: "`Usage: k!roll [die count]d<sides>[modifiers]`",
		description: "Rolls dice.",
		subtitle: "Defaults to a d20 if nothing is specified."
	},
	playlist: {
		cmd: list,
		usage: "`Usage: k!playlist`",
		description: "Drops a link for the music playlist."
	},
	list: {
		cmd: list,
		usage: "`Usage: k!list`",
		description: "Does the same thing as k!playlist."
	},
	add: {
		cmd: add,
		usage: "`Usage: k!add <query|URL>`",
		description: "Adds a song to the playlist.",
		subtitle: "The user can specify a search query or a URL."
	},
	remove: {
		cmd: remove,
		usage: "`Usage: k!remove <index|query|URL>`",
		description: "Removes a song from the playlist."
	},
	join: {
		cmd: join,
		usage: "`Usage: k!join`",
		description: "Has the bot join the user's voice channel."
	},
	volume: {
		cmd: volume,
		usage: "`Usage: k!volume <number>`",
		description: "Changes the bot's music volume.",
		subtitle: "The number is automatically truncated to range from 0 to 1.5."
	},
	shuffle: {
		cmd: shuffle,
		usage: "`Usage: k!shuffle`",
		description: "Toggles shuffle on the music player."
	},
	play: {
		cmd: play,
		usage: "`Usage: k!play [index|query|URL]`",
		description: "Starts playing a song in the connected voice channel.",
		subtitle: "The user can specify a playlist index, a search query, or a URL to add to the playlist."
	},
	queue: {
		cmd: queue,
		usage: "`Usage: k!queue [index|query|URL]`",
		description: "Displays the user defined song queue or adds a song to said queue."
	},
	dequeue: {
		cmd: dequeue,
		usage: "`Usage: k!dequeue <index|query>`",
		description: "Removes a song from the user defined song queue."
	},
	next: {
		cmd: next,
		usage: "`Usage: k!next <index|query|URL>`",
		description: "Adds a song to the front of the user defined song queue."
	},
	skip: {
		cmd: skip,
		usage: "`Usage: k!skip`",
		description: "Skips the currently playing song."
	},
	stop: {
		cmd: stop,
		usage: "`Usage: k!stop`",
		description: "Stops playing music and disconnects from the voice channel."
	},
	song: {
		cmd: song,
		usage: "`Usage: k!song`",
		description: "Displays the currently playing song."
	},
	playing: {
		cmd: song,
		usage: "`Usage: k!playing`",
		description: "Does the same thing as k!song."
	},
	url: {
		cmd: url,
		usage: "`Usage: k!url [title|index]`",
		description: "Displays the URL of the currently playing  or specified song."
	}
};

exports.init = function init(bot) { // Initialize the bot
	client = bot;
	music = {};
	for (var guild of client.guilds.values()) { // Initialize music handler
		exports.newGuild(guild);
	}
	update();
	for (var cmd in commands) { // Assemble the command list
		if (!(commands[cmd].botmin || commands[cmd].hi)) {
			cl.description += cmd + " - " + commands[cmd].description + "\n";
		}
	}
};

exports.deinit = function deinit() { // Cleanup and shutdown the bot
	client.voiceConnections.tap((connection) => {
		music[connection.channel.guild.id].playing = null;
		music[connection.channel.guild.id].upcoming.clear();
		connection.disconnect();
	});
	client.destroy(); // Die
};

exports.newGuild = function newGuild(guild) { // Handle joining a guild
	music[guild.id] = new Music(guild.id);
	if (!config.servers[guild.id]) {
		config.servers[guild.id] = {
			name: guild.name,
			music: {
				shuffle: false,
				volume: 1
			}
		};
	}
};

exports.updateGuild = function updateGuild(guild) { // Update a guild's name
	if (!config.servers[guild.id]) {
		exports.newGuild(guild);
	}
	config.servers[guild.id].name = guild.name;
}

exports.oldGuild = function oldGuild(guild) { // Handle leaving a guild
	if (music[guild]) {
		delete music[guild];
	}
};

exports.handle = function handle(message) { // Handle messages
	var prefix;
	if (!music[message.guild.id]) {
		exports.newGuild(message.guild);
	}
	if (prefix = prefixCheck(message.content, message.guild.id)) {
		var cmd = message.content.substring(prefix.length).split(' ')[0].toLowerCase();
		if (commands[cmd]) {
			logCommand(message);
			if (!commands[cmd].botmin || (commands[cmd].botmin && message.author.id == config.adminID)) {
				commands[cmd].cmd(prefix, message);
			}
		}
	}
};

async function logCommand(message) { // Log bot commands
	var user = message.author.username + "#" + message.author.discriminator;
	console.log("[" + message.guild.id + "] " + (message.author.id == config.adminID ? user.magenta : user.cyan) + ": " + message.content);
}

function sendMessage(channel, message) { // Log bot messages
	return new Promise((resolve, reject) => {
		if (message.length < 200) {
			console.log("[" + channel.guild.id + "] " + (client.user.username + "#" + client.user.discriminator).green + ": " + message);
		}
		channel.send(message).then(resolve).catch(reject);
	});
}

function prefixCheck(text, guild) { // Check for any prefix
	for (var i in config.prefix) {
		if (config.prefix[i] && text.startsWith(config.prefix[i])) {
			return config.prefix[i];
		}
	}
	return (config.servers[guild].prefix && text.startsWith(config.servers[guild].prefix)) ? config.servers[guild].prefix : null;
}

function update() { // Update config.json
	return jsonfile.writeFile("../config.json", config, {spaces: 4});
}

function onEndSong(guild, connection) { // Handle ends of songs
	if (music[guild].readable) {
		music[guild].readable.destroy();
	}
	if (connection.dispatcher) {
		connection.dispatcher.end();
	}
	music[guild].readable = null;
	connection.dispatcher = null;
	if (music[guild].playing) {
		music[guild].skip(config.servers[guild].music.shuffle).then((stream) => {
			if (stream) {
				connection.playStream(stream, {volume: config.servers[guild].music.volume}).on("end", () => { // Play another song
					onEndSong(guild, connection);
				});
			}
		}).catch((error) => {
			console.log(error);
			onEndSong(guild, connection);
		});
	}
};

function restart(p, message) { // End program and let CMD handle restarting
	sendMessage(message.channel, "Restarting").then(() => {
		exports.deinit();
	}).catch(console.log);
}

function help(p, message) { // Command help
	var args = message.content.substring(p.length).split(' ');
	if (args.length > 1) {
		if (commands[args[1]]) {
			var reply = commands[args[1]].usage + " " + commands[args[1]].description;
			if (commands[args[1]].subtitle) {
				reply += " " + commands[args[1]].subtitle;
			}
			sendMessage(message.channel, reply).catch(console.log); // Specific command description
		}
	}
	else { // Send preassembled command list
		cl.setColor("RANDOM");
		message.channel.send("", cl).catch(console.log);
	}
}

function invite(p, message) { // Invite link
	sendMessage(message.channel, "https://discordapp.com/api/oauth2/authorize?client_id=" + config.botID + "&permissions=8&scope=bot").catch(console.log);
}

function prefix(p, message) { // Change the command prefix
	var args = message.content.substring(p.length).split(' ');
	if (args.length > 1) {
		config.servers[message.guild.id].prefix = args[1];
		update().catch(console.log);
		sendMessage(message.channel, "Prefix updated to `" + args[1] + "`").catch(console.log);
	}
	else {
		sendMessage(message.channel, commands.prefix.usage).catch(console.log); // Incorrect usage
	}
}

function prune(p, message) { // Delete messages
	var args = message.content.substring(p.length).split(' ');
	if (args.length > 1) {
		var count = Math.floor(Number(args[1])); // Parse number
		if (count) {
			if (count <= 100) { // Limit by Discord
				if (args.length > 2) {
					var userID;
					message.mentions.users.forEach((value, key, map) => { // Check if arg is a user ID
						if (args[2].includes(key)) {
							userID = key;
						}
					});
					if (userID) {
						message.channel.fetchMessages({limit: count}).then((messages) => { // k!prune <number> [user]
							message.channel.bulkDelete(messages.filter((m) => {
								return m.author.id == userID;
							}), true).catch(console.log);
						}).catch(console.log);
					}
					else {
						sendMessage(message.channel, "User `" + args[2] + "` not found").catch(console.log); // Invalid user
					}
				}
				else {
					message.channel.bulkDelete(count, true).catch(console.log); // k!prune <number>
				}
			}
			else {
				sendMessage(message.channel, "Number cannot exceed 100").catch(console.log); // Too many messages
			}
		}
		else {
			if (count != 0) { // User might just be dumb
				sendMessage(message.channel, commands.prune.usage).catch(console.log); // Incorrect usage
			}
		}
	}
	else {
		sendMessage(message.channel, commands.prune.usage).catch(console.log); // Incorrect usage
	}
}

function roll(p, message) { // Roll dice
	var args = message.content.substring(p.length).split(' '), query = "d20", parse;
	if (args.length > 1) {
		args.shift();
		query = args.join();
	}
	if (parse = rollParser.parse(query)) {
		var min = parse.count, max = parse.count * parse.dice, result = rollParser.roll(parse).value, reply;
		reply = "<@!" + message.author.id + "> rolled a `" + result + "`";
		if (min != max) {
			var natural = result - parse.modifier;
			if (natural == min) { // Critical failure
				if (config.roll.failure) {
					reply += "\n" + config.roll.failure;
				}
			}
			else if (natural == max) { // Critical success
				if (config.roll.success) {
					reply += "\n" + config.roll.success;
				}
			}
		}
		sendMessage(message.channel, reply).catch(console.log); // Success
	}
	else {
		sendMessage(message.channel, commands.roll.usage).catch(console.log); // Bad args
	}
}

function list(p, message) { // Displays the playlist
	music[message.guild.id].list().then((link) => {
		sendMessage(message.channel, link).catch(console.log);
	}).catch(console.log);
}

function add(p, message) { // Add a song to the playlist
	var args = message.content.substring(p.length).split(' ');
	if (args.length > 1) {
		args.shift();
		var query = args.join(' ');
		music[message.guild.id].add(query).then((response) => {
			if (response.title) {
				if (response.exist) {
					sendMessage(message.channel, "`" + response.title + "` is already in the playlist").catch(console.log); // Duplicate
				}
				else {
					sendMessage(message.channel, "Added `" + response.title + "` to the playlist").catch(console.log); // Success
				}
			}
			else {
				sendMessage(message.channel, "Could not find `" + query + "`").catch(console.log); // Failure
			}
		}).catch(console.log);
	}
	else {
		sendMessage(message.channel, commands.add.usage).catch(console.log); // Incorrect usage
	}
}

function remove(p, message) { // Remove a song from the playlist
	var args = message.content.substring(p.length).split(' ');
	if (args.length > 1) {
		args.shift();
		var query = args.join(' ');
		music[message.guild.id].remove(query).then((title) => {
			if (title) {
				sendMessage(message.channel, "Removed `" + title + "` from the playlist").catch(console.log); // Success
			}
			else {
				sendMessage(message.channel, "Could not find `" + query + "` in the playlist").catch(console.log); // Failure
			}
		}).catch(console.log);
	}
	else {
		sendMessage(message.channel, commands.remove.usage).catch(console.log); // Incorrect usage
	}
}

function join(p, message) { // Join a voice channel
	if (message.member.voiceChannel) {
		var args = message.content.substring(p.length).split(' ');
		message.member.voiceChannel.join().then((connection) => {
			var cmd = args[0].toLowerCase();
			connection.on("disconnect", () => { // Cleanup on disconnect
				music[message.guild.id].playing = null;
				music[message.guild.id].upcoming.clear();
				if (connection.dispatcher) {
					connection.dispatcher.end();
				}
			});
			sendMessage(message.channel, "Connected to `" + connection.channel.name + "`").then(() => {
				if (cmd != "join") {
					commands[cmd].cmd(p, message); // Head back to the originally called command
				}
			}).catch(console.log);
		}).catch(console.log);
	}
}

function volume(p, message) { // Change the bot's music volume
	var args = message.content.substring(p.length).split(' ');
	if (args.length > 1) {
		var vol = Number(args[1]);
		if (vol || vol === 0) {
			vol = Math.max(0, Math.min(1.5, vol));
			config.servers[message.guild.id].music.volume = vol;
			update().catch(console.log);
			sendMessage(message.channel, "Volume updated to `" + vol + "`").catch(console.log);
		}
		else {
			sendMessage(message.channel, commands.volume.usage).catch(console.log); // Incorrect usage
		}
	}
	else {
		sendMessage(message.channel, commands.volume.usage).catch(console.log); // Incorrect usage
	}
}

async function shuffle(p, message) { // Toggle shuffle
	config.servers[message.guild.id].music.shuffle = !config.servers[message.guild.id].music.shuffle;
	await update().catch(console.log);
	sendMessage(message.channel, "Shuffle is now `" + (config.servers[message.guild.id].music.shuffle ? "on" : "off") + "`").catch(console.log);
}

function play(p, message) { // Start playing music
	if (client.voiceConnections.has(message.guild.id)) {
		var connection = client.voiceConnections.get(message.guild.id), args = message.content.substring(p.length).split(' '), query;
		args.shift();
		query = args.join(' ');
		if (query) { // Specific song request
			if (connection.dispatcher) {
				music[message.guild.id].playing = null;
				connection.dispatcher.end(); // Stop currently playing music
			}
			music[message.guild.id].play(config.servers[message.guild.id].music.shuffle, query).then((stream) => {
				if (stream) {
					connection.playStream(stream, {volume: config.servers[message.guild.id].music.volume}).on("end", () => {
						onEndSong(message.guild.id, connection);
					}); // Success
					song(p, message);
				}
				else {
					sendMessage(message.channel, "Could not find the specified song").catch(console.log); // Failure
				}
			}).catch((error) => {
				sendMessage(message.channel, error).catch(console.log);
				skip(p, message);
			});
		}
		else {
			if (!connection.dispatcher) {
				music[message.guild.id].skip(config.servers[message.guild.id].music.shuffle).then((stream) => {
					if (stream) {
						connection.playStream(stream, {volume: config.servers[message.guild.id].music.volume}).on("end", () => {
							onEndSong(message.guild.id, connection);
						}); // Success
						song(p, message);
					}
					else {
						sendMessage(message.channel, "There are no songs in the playlist").catch(console.log); // Empty playlist
					}
				}).catch((error) => {
					sendMessage(message.channel, error).catch(console.log);
					skip(p, message);
				});
			}
		}
	}
	else {
		join(p, message); // Join voice channel first
	}
}

function queue(p, message) { // Display or add to upcoming song queue
	if (client.voiceConnections.has(message.guild.id)) {
		var args = message.content.substring(p.length).split(' '), query;
		args.shift();
		query = args.join(' ');
		music[message.guild.id].queue(query).then((response, exist) => {
			if (query) {
				if (response) {
					if (!exist) {
						sendMessage(message.channel, "Added `" + response + "` to the queue").catch(console.log); // Success
					}
					else {
						sendMessage(message.channel, "`" + response + "` is already in the song queue").catch(console.log); // Song already in queue
					}
				}
				else {
					sendMessage(message.channel, "Could not find the specified song").catch(console.log); // Failure
				}
			}
			else {
				var length = 7;
				response = response.filter((element) => { // Don't go over the character limit
					if (element) {
						length += element.length;
					}
					return length < 2000;
				});
				sendMessage(message.channel, "```\n" + response.join("\n") + "```").catch(console.log);
			}
		}).catch(console.log);
	}
}

function dequeue(p, message) { // Remove songs from upcoming queue
	if (client.voiceConnections.has(message.guild.id)) {
		var args = message.content.substring(p.length).split(' '), query;
		args.shift();
		query = args.join(' ');
		if (query) {
			var title = music[message.guild.id].dequeue(query);
			if (title) {
				sendMessage(message.channel, "Removed `" + title + "` from the queue").catch(console.log); // Success
			}
			else {
				sendMessage(message.channel, "Could not find `" + query + "` in the user defined queue").catch(console.log); // Failure
			}
		}
		else {
			sendMessage(message.channel, commands.dequeue.usage).catch(console.log); // Incorrect usage
		}
	}
}

function next(p, message) { // Add a song to the front of the queue
	if (client.voiceConnections.has(message.guild.id)) {
		var args = message.content.substring(p.length).split(' '), query;
		args.shift();
		query = args.join(' ');
		if (query) {
			music[message.guild.id].next(query).then((title) => {
				if (title) {
					sendMessage(message.channel, "Added `" + title + "` to the front of the queue").catch(console.log); // Success
				}
				else {
					sendMessage(message.channel, "Could not find the specified song").catch(console.log); // Failure
				}
			}).catch(console.log);
		}
		else {
			sendMessage(message.channel, commands.next.usage).catch(console.log); // Incorrect usage
		}
	}
}

function skip(p, message) { // Skip the currently playing song
	if (music[message.guild.id].playing) {
		if (client.voiceConnections.has(message.guild.id)) {
			var connection = client.voiceConnections.get(message.guild.id);
			if (connection.dispatcher) {
				connection.dispatcher.end(); // Event handling will play a new song
				song(p, message);
			}
			else {
				music[message.guild.id].skip(config.servers[message.guild.id].music.shuffle).then((stream) => {
					if (stream) {
						connection.playStream(stream, {volume: config.servers[message.guild.id].music.volume}).on("end", () => {
							onEndSong(message.guild.id, connection);
						}); // Success
						song(p, message);
					}
					else {
						sendMessage(message.channel, "There are no songs in the playlist").catch(console.log); // Empty playlist
					}
				}).catch((error) => {
					sendMessage(message.channel, error).catch(console.log);
					skip(p, message);
				});
			}
		}
		else {
			join(p, message); // Join voice channel first
		}
	}
}

function stop(p, message) { // Stop playing music and leave the voice channel
	if (client.voiceConnections.has(message.guild.id)) {
		var connection = client.voiceConnections.get(message.guild.id);
		connection.disconnect();
		sendMessage(message.channel, "Disconnected").catch(console.log);
	}
}

function song(p, message) { // Displays currently playing song
	if (music[message.guild.id].playing) {
		sendMessage(message.channel, "Now playing `" + music[message.guild.id].playing + "`").catch(console.log);
	}
}

function url(p, message) { // Displays the URL of a song
	var args = message.content.substring(p.length).split(' '), query, u;
	args.shift();
	query = args.join(' ');
	u = music[message.guild.id].url(query);
	if (u) {
		sendMessage(message.channel, u).catch(console.log); // Success
	}
	else if (query) {
		sendMessage(message.channel, "Could not find the specified song").catch(console.log); // Failure
	}
}
