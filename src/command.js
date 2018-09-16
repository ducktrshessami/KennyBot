const file = require("fs"); // File I/O
const colors = require("colors"); // Colored log
const Music = require("./music.js"); // Music handling
var config = require("../config.json"); // Bot configuration

var client; // Discord client
var music = new Music(); // Music handler
var commands = { // Command list
	restart: {
		cmd: restart,
		usage: "`Usage: k!restart`",
		description: "Restarts the bot. Botmin only.",
		botmin: "sup"
	},
	help: {
		cmd: help,
		usage: "`Usage: k!help [command]`",
		description: "Displays a command list or describes a specific command.\n<> denotes a required parameter, while [] denotes an optional one."
	},
	prefix: {
		cmd: prefix,
		usage: "`Usage: k!prefix <prefix>`",
		description: "Sets a user defined command prefix. k! and @KennyBot will always work regardless of the user defined prefix.",
		botmin: "asdf"
	},
	prune: {
		cmd: prune,
		usage: "`Usage: k!prune <number> [user]`",
		description: "Deletes up to a given number of messages. The deleted messages can be filtered to a specified user.\nDiscord only allows up to 100 messages to be deleted at a time."
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
		description: "Adds a song to the playlist. The user can specify a search query or a URL."
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
		description: "Changes the bot's music volume. The number is automatically truncated to range from 0 to 1.5. Botmin only.",
		botmin: "yeah"
	},
	shuffle: {
		cmd: shuffle,
		usage: "`Usage: k!shuffle`",
		description: "Toggles shuffle on the music player."
	},
	play: {
		cmd: play,
		usage: "`Usage: k!play [index|query|URL]`",
		description: "Starts playing a song in the connected voice channel.\nThe user can specify a playlist index, a search query, or a URL to add to the playlist."
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
		usage: "`Usage: k!url`",
		description: "Displays the URL of the currently playing song."
	}
};

exports.init = function init(bot) { // Store the Discord client
	client = bot;
}

exports.deinit = function deinit() {
	client.voiceConnections.tap((connection) => { // Close all voice connections
		if (connection.dispatcher) {
			connection.dispatcher.on("end", () => {
				music.playing = null;
				music.readable.destroy();
				music.recent.clear();
				music.upcoming.clear();
			});
			connection.dispatcher.end(); // Stop playing audio
		}
		connection.disconnect(); // Disconnect from the voice channel
	});
	client.destroy(); // Die
}

exports.handle = function handle(message) { // Handle messages
	var prefix;
	if (!music.guild) {
		music.guild = message.guild.id;
	}
	if (prefix = prefixCheck(message.content)) {
		var cmd = message.content.substring(prefix.length).split(' ')[0].toLowerCase();
		if (commands[cmd]) {
			logCommand(message);
			if (!commands[cmd].botmin || (commands[cmd].botmin && message.author.id == config.adminID)) {
				commands[cmd].cmd(prefix, message);
			}
		}
	}
}

async function logCommand(message) { // Log bot commands
	var user = message.author.username + "#" + message.author.discriminator;
	console.log((message.author.id == config.adminID ? user.magenta : user.cyan) + ": " + message.content);
}

function sendMessage(channel, message) { // Log bot messages
	return new Promise((resolve, reject) => {
		if (message.length < 200) {
			console.log((client.user.username + "#" + client.user.discriminator).green + ": " + message);
		}
		channel.send(message).then(resolve).catch(reject);
	});
}

function prefixCheck(text) { // Check for any prefix
	for (var i in config.prefix) {
		if (config.prefix[i] && text.startsWith(config.prefix[i])) {
			return config.prefix[i];
		}
	}
}

function update() { // Update config.json
	return new Promise((resolve, reject) => {
		file.writeFile("../config.json", JSON.stringify(config, null, 4), (error) => {
			if (error) {
				reject(error);
			}
			else {
				resolve();
			}
		});
	});
}

function onEndSong() { // When a song stream ends
	music.readable.destroy();
	if (client.voiceConnections.has(music.guild) && music.playing) {
		var connection = client.voiceConnections.get(music.guild);
		music.skip().then((stream) => {
			if (stream) {
				connection.playStream(stream, {volume: config.music.volume}).on("end", onEndSong); // another one begins
			}
		}).catch(console.log);
	}
}

function restart(p, message) { // End program and let CMD handle restarting
	sendMessage(message.channel, "Restarting").then(() => {
		exports.deinit();
	}).catch(console.log);
}

function help(p, message) { // Command help
	var args = message.content.substring(p.length).split(' ');
	if (args.length > 1) {
		if (commands[args[1]]) {
			sendMessage(message.channel, commands[args[1]].usage + " " + commands[args[1]].description).catch(console.log); // Specific command description
		}
	}
	else {
		var cl = "```makefile\n"; // Assemble the command list
		for (var cmd in commands) {
			if (!commands[cmd].botmin) {
				cl += cmd + ":\n" + commands[cmd].description + "\n";
			}
		}
		cl += "```";
		sendMessage(message.channel, cl).catch(console.log);
	}
}

function prefix(p, message) { // Change the command prefix
	var args = message.content.substring(p.length).split(' ');
	if (args.length > 1) {
		config.prefix[0] = args[1];
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

function list(p, message) { // Displays the playlist
	music.list().then((link) => {
		sendMessage(message.channel, link).catch(console.log);
	}).catch(console.log);
}

function add(p, message) { // Add a song to the playlist
	var args = message.content.substring(p.length).split(' ');
	if (args.length > 1) {
		args.shift();
		var query = args.join(' ');
		music.add(query).then((response) => {
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
		music.remove(query).then((title) => {
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
			config.music.volume = vol;
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
	config.music.shuffle = !config.music.shuffle;
	await update().catch(console.log);
	music.shuffle();
	sendMessage(message.channel, "Shuffle is now `" + (config.music.shuffle ? "on" : "off") + "`").catch(console.log);
}

function play(p, message) { // Start playing music
	if (client.voiceConnections.has(message.guild.id)) {
		var connection = client.voiceConnections.get(message.guild.id), args = message.content.substring(p.length).split(' '), query;
		args.shift();
		query = args.join(' ');
		if (query) { // Specific song request
			if (connection.dispatcher) {
				music.playing = null;
				connection.dispatcher.end(); // Stop currently playing music
			}
			music.play(query).then((stream) => {
				if (stream) {
					connection.playStream(stream, {volume: config.music.volume}).on("end", onEndSong); // Success
					song(p, message);
				}
				else {
					sendMessage(message.channel, "Could not find the specified song").catch(console.log); // Failure
				}
			}).catch(console.log);
		}
		else {
			if (!connection.dispatcher) {
				music.skip().then((stream) => {
					if (stream) {
						connection.playStream(stream, {volume: config.music.volume}).on("end", onEndSong); // Success
						song(p, message);
					}
					else {
						sendMessage(message.channel, "There are no songs in the playlist").catch(console.log); // Empty playlist
					}
				}).catch(console.log);
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
		music.queue(query).then((response, exist) => {
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
			var title = music.dequeue(query);
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
			music.next(query).then((title) => {
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
	if (music.playing) {
		if (client.voiceConnections.has(message.guild.id)) {
			var connection = client.voiceConnections.get(message.guild.id);
			if (connection.dispatcher) {
				connection.dispatcher.end(); // onEndSong will play a new song
				song(p, message);
			}
			else {
				music.skip().then((stream) => {
					if (stream) {
						connection.playStream(stream, {volume: config.music.volume}).on("end", onEndSong); // Success
						song(p, message);
					}
					else {
						sendMessage(message.channel, "There are no songs in the playlist").catch(console.log); // Empty playlist
					}
				}).catch(console.log);
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
		if (connection.dispatcher) {
			music.playing = null;
			connection.dispatcher.on("end", () => {
				music.recent.clear();
				music.upcoming.clear();
			});
			connection.dispatcher.end();
		}
		connection.disconnect();
		sendMessage(message.channel, "Disconnected").catch(console.log);
	}
}

function song(p, message) { // Displays currently playing song
	if (music.playing) {
		sendMessage(message.channel, "Now playing `" + music.playing + "`").catch(console.log);
	}
}

function url(p, message) { // Displays the URL of the currently playing song
	var u = music.url();
	if (u) {
		sendMessage(message.channel, u).catch(console.log);
	}
}
