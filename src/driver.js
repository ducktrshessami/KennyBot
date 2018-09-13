const Discord = require("discord.js"); // Discord
const colors = require("colors"); // Colored log
const readline = require("readline"); // Console input
const command = require("./command"); // Command handler
const config = require("../config.json"); // App token

// Setup
process.chdir(__dirname); // Sync working directory for fs
const client = new Discord.Client(); // Discord client
const rl = readline.createInterface({ // Console input
	input: process.stdin,
	output: process.stdout
});
var pInterval, pLast = Math.floor(Math.random() * config.presence.games.length); // Presence stuff
client.on("ready", () => { // Green light
	command.init(client);
	client.user.setPresence(config.presence.games[pLast]); // Set initial presence
	pInterval = setInterval(() => {
		var p = Math.floor(Math.random() * config.presence.games.length);
		if (p == pLast) { // Don't set the same one twice in a row
			if (++p >= config.presence.games.length) {
				p = 0;
			}
		}
		pLast = p;
		client.user.setPresence(config.presence.games[p]); // Set new presence
		console.log("Set new presence".yellow);
	}, config.presence.interval * 60000);
	console.log(("Logged in as " + client.user.username + "#" + client.user.discriminator + " (" + client.user.id + ")").green);
});
client.login(config.token); // Login

// Event handling
client.on("message", (message) => { // Handle messages
	if (message.guild) {
		command.handle(message);
	}
});
rl.on("line", (line) => { // Wait for exit command
	if (line == "exit") {
		command.deinit();
	}
});
client.on("disconnect", () => { // End program
	clearInterval(pInterval);
	rl.close();
	throw "Logging off".red;
});
