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
const activityTypes = [
	"PLAYING",
	"STREAMING",
	"LISTENING",
	"WATCHING"
];
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
		console.log("Set new presence".yellow + ": " + (activityTypes[config.presence.games[p].game.type] ? activityTypes[config.presence.games[p].game.type] : config.presence.games[p].game.type) + config.presence.games[p].game.name);
	}, config.presence.interval * 60000);
	console.log(("Logged in as " + client.user.username + "#" + client.user.discriminator + " (" + client.user.id + ")").green);
	console.log("Set new presence".yellow + ": " + (activityTypes[config.presence.games[pLast].game.type] ? activityTypes[config.presence.games[pLast].game.type] : config.presence.games[pLast].game.type) + " " + config.presence.games[pLast].game.name);
});
client.login(config.token).catch(console.log); // Login

// Event handling
client.on("guildCreate", (guild) => { // Handle new guild
	command.newGuild(guild);
	console.log(("Joined new server: " + guild.name + " (" + guild.id + ")").grey);
});
client.on("guildUpdate", (before, after) => {
	command.updateGuild(after);
	console.log(("Updated server: '" + before.name + "' to '" + after.name + "' (" + after.id + ")").grey);
});
client.on("guildDelete", (guild) => { // Handle leaving guild
	command.oldGuild(guild);
	console.log(("Left server: " + guild.name + " (" + guild.id + ")").grey);
});
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
