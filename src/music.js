const file = require("fs"); // File I/O
const request = require("request"); // HTTP requests
const YouTube = require("ytdl-core"); // YouTube streaming
const gists = require("gists"); // Gist hosted playlist
const Queue = require("./queue"); // Last played queue
var config = require("../config.json"); // Music and search engine config
var playlist = require("../playlist.json"); // List of songs

const gist = new gists({ // Log in to Gist
	username: config.gist.username,
	password: config.gist.password
});

function similarity(foo, bar) { // Makeshift string similarity check
	if (foo && bar) {
		var count = 0, filler = ",.-:;-\"\\/#()\t\n";
		foo = foo.toLowerCase().split(' ');
		bar = bar.toLowerCase();
		foo.forEach((element) => {
			for (var i in filler) {
				element.replace("/" + filler[i] + "/g", "");
			}
			if (bar.includes(element)) {
				++count;
			}
		});
		return count / foo.length;
	}
}

function google(query, callback) { // CSE search
	request.get("https://www.googleapis.com/customsearch/v1?key=" + config.CSE.apikey + "&cx=" + config.CSE.engineID + "&safe=" + (config.CSE.safe ? "active" : "off") + "&q=" + query, {json: true}, (error, response, body) => {
		if (error) {
			console.log(error);
		}
		else {
			callback(body);
		}
	});
}

function scResolve(url, callback) { // SoundCloud API call
	request.get("http://api.soundcloud.com/resolve?client_id=" + config.soundcloud.clientID + "&url=" + url, {json: true}, (error, response, body) => {
		if (error) {
			console.log(error);
		}
		else {
			if (body.errors) {
				callback();
			}
			else {
				callback(body);
			}
		}
	});
}

module.exports = class Music {
	constructor() {
		this.guild = null;
		this.playing = null;
		this.readable = null;
		this.recent = new Queue(Math.floor(playlist.urls.length / 2));
		this.upcoming = new Queue();
		this.backup = null;
	}
	
	update() { // Update playlist.json
		for (var i = 0; i < playlist.titles.length; ++i) { // Get rid of null entries that I never debugged lol
			if (!playlist.titles[i] || !playlist.urls[i]) {
				playlist.titles.splice(i, 1);
				playlist.urls.splice(i, 1);
			}
		}
		this.recent.length = Math.floor(playlist.urls.length / 2); // Resize recent playlist
		file.writeFile("../playlist.json", JSON.stringify(playlist, null, 4), (error) => {
			if (error) {
				console.log(error);
			}
		});
		gist.list(config.gist.username).then((response) => { // Post to Gist
			var gs = [], options = {
				description: this.guild,
				public: false,
				files: {}
			};
			options.files[this.guild] = {
				content: playlist.titles.join('\n')
			};
			response.body.forEach((g) => {
				if (g.files[this.guild] && Object.keys(g.files).length == 1) {
					gs.push(g);
				}
			});
			if (gs.length == 1) { // List found
				gs = gs[0];
				gist.edit(gs.id, options).catch(console.log);
			}
			else {
				gs.forEach((g) => { // Delete dupes (not a known bug, just precautionary)
					gist.delete(g.id);
				});
				gist.create(options).catch(console.log); // Create correct one
			}
		}).catch(console.log);
	}
	
	list(callback) { // Get Gist playlist URL
		gist.list(config.gist.username).then((response) => {
			var gs = [], options = {
				description: this.guild,
				public: false,
				files: {}
			};
			options.files[this.guild] = {
				content: playlist.titles.join('\n')
			};
			response.body.forEach((g) => {
				if (g.files[this.guild] && Object.keys(g.files).length == 1) {
					gs.push(g);
				}
			});
			if (gs.length == 1) { // List found
				callback(gs[0].html_url);
			}
			else {
				gs.forEach((g) => { // Delete dupes (still precautionary)
					gist.delete(g.id);
				});
				gist.create(options).then((response) => { // Create correct one
					callback(response.body.html_url);
				}).catch(console.log);
			}
		}).catch(console.log);
	}
	
	add(query, callback) { // Add a song to the playlist
		if (YouTube.validateURL(query)) { // Is YouTube URL
			query = "https://youtube.com/watch?v=" + YouTube.getURLVideoID(query);
			if (playlist.urls.includes(query)) { // Already in playlist
				callback(playlist.titles[playlist.urls.indexOf(query)], true);
			}
			else { // Not in playlist yet
				YouTube.getBasicInfo(query).then((info) => {
					playlist.titles.push(info.title);
					playlist.urls.push(query);
					this.update();
					callback(info.title, false);
				});
			}
		}
		else {
			scResolve(query, (song) => {
				if (song) { // Is SoundCloud URL
					query = song.permalink_url;
					if (playlist.urls.includes(query)) {
						callback(playlist.titles[playlist.urls.indexOf(query)], true);
					}
					else {
						playlist.titles.push(song.title);
						playlist.urls.push(query);
						this.update();
						callback(song.title, false);
					}
				}
				else { // Not YouTube/SoundCloud URL (treat as CSE search query)
					var title, s, t, current = 0;
					for (var i = 0; i < playlist.titles.length; ++i) { // Check if query matches a song in the playlist
						s = similarity(query, playlist.titles[i]);
						if (s >= config.similarityReq.playlist && s > current) {
							title = playlist.titles[i];
							current = s;
						}
					}
					if (title) { // Song already in playlist
						callback(title, true);
					}
					else { // Time for a CSE search
						google(query, (body) => {
							var url;
							title = null;
							current = 0;
							for (var i in body.items) { // Check each result
								t = body.items[i].title.endsWith(config.CSE.titleSuffix[body.items[i].displayLink]) ? body.items[i].title.substr(0, body.items[i].title.length - config.CSE.titleSuffix[body.items[i].displayLink].length) : body.items[i].title;
								s = similarity(query, t);
								if (s >= config.similarityReq.CSE && s > current) {
									title = t;
									url = body.items[i].link;
									current = s;
								}
							}
							if (title && url) { // Song found
								this.add(url, callback);
							}
							else {
								callback(title, false);
							}
						});
					}
				}
			});
		}
	}
	
	before() { // Helper for remove() that handles changes in indices while playing music
		this.backup = {
			recent: this.recent.elems.map((element) => {
				return playlist.titles[element];
			}),
			upcoming: this.upcoming.elems.map((element) => {
				return playlist.titles[element];
			})
		};
	}
	
	after() { // Helper for before()
		if (this.backup) {
			this.recent.elems = this.backup.recent.map((element) => {
				return playlist.titles.indexOf(element);
			});
			this.upcoming.elems = this.backup.upcoming.map((element) => {
				return playlist.titles.indexOf(element);
			});
			this.backup = null;
		}
	}
	
	remove(query) { // Remove a song from the playlist
		var index = Number(query), title;
		if (index) { // Query was a playlist index
			if (--index < playlist.titles.length) {
				this.before();
				title = playlist.titles.splice(index, 1)[0];
				playlist.urls.splice(index, 1);
				this.after();
				this.update();
				return title;
			}
		}
		else {
			if ((index = playlist.urls.indexOf(query)) >= 0) { // Is a URL
				this.before();
				title = playlist.titles.splice(index, 1)[0];
				playlist.urls.splice(index, 1);
				this.after();
				this.update();
				return title;
			}
			else { // Check titles
				var current = 0, s;
				for (var i = 0; i < playlist.titles.length; ++i) {
					s = similarity(query, playlist.titles[i]);
					if (s >= config.similarityReq.playlist && s > current) {
						index = i;
						current = s;
					}
				}
				if (current) { // Found a song
					this.before();
					title = playlist.titles.splice(index, 1)[0];
					playlist.urls.splice(index, 1);
					this.after();
					this.update();
					return title;
				}
			}
		}
	}
	
	shuffle() { // Reacquire configuration
		config = require("../config.json"); // command.js already changed the setting
	}
	
	play(query, callback) { // Play a song, add it the playlist if need be
		var index;
		if (query) { // Picked a song
			if ((index = Number(query)) <= playlist.urls.length) { // It was a number
				if (index) {
					--index;
					if (this.recent.includes(index)) { // Ignore the fact that it's been played recently
						this.recent.elems.splice(this.recent.elems.indexOf(index), 1);
					}
					this.recent.push(index);
					this.playing = playlist.titles[index];
					if (YouTube.validateURL(playlist.urls[index])) { // YouTube
						this.readable = YouTube(playlist.urls[index], {filter: "audioonly"});
						callback(this.readable);
					}
					else {
						scResolve(playlist.urls[index], (song) => { // SoundCloud
							if (song) {
								this.readable = request.get(song.stream_url + "?client_id=" + config.soundcloud.clientID);
								callback(this.readable);
							}
						});
					}
				}
			}
			else {
				if (YouTube.validateURL(query)) { // It was a YouTube URL
					query = "https://youtube.com/watch?v=" + YouTube.getURLVideoID(query);
					if (playlist.urls.includes(query)) {
						this.play(playlist.urls.indexOf(query) + 1, callback);
					}
					else {
						this.add(query, (title, exist) => { // Add to the playlist if not already there
							if (title) {
								this.play(playlist.titles.indexOf(title) + 1, callback);
							}
						});
					}
				}
				else {
					scResolve(query, (song) => {
						if (song) { // It was a SoundCloud URL
							query = song.permalink_url;
							if (playlist.urls.includes(query)) {
								this.play(playlist.urls.indexOf(query) + 1, callback);
							}
							else {
								this.add(query, (title, exist) => { // Add o the playlist if not already there
									if (title) {
										this.play(playlist.titles.indexOf(title) + 1, callback);
									}
								});
							}
						}
						else {
							var current = 0, s;
							for (var i = 0; i < playlist.titles.length; ++i) { // Check playlist for query
								s = similarity(query, playlist.titles[i]);
								if (s >= config.similarityReq.playlist && s > current) {
									index = i;
									current = s;
								}
							}
							if (current) { // Found in playlist
								this.play(index + 1, callback);
							}
							else {
								this.add(query, (title, exist) => { // Search for it online
									if (title) {
										this.play(playlist.titles.indexOf(title) + 1, callback);
									}
								});
							}
						}
					});
				}
			}
		}
		else { // Just start playing
			if (playlist.urls.length) {
				if (this.upcoming.empty()) { // Pick a random song
					index = Math.floor(Math.random() * playlist.urls.length);
					if (playlist.urls.length > 10) {
						--index;
						while (this.recent.includes(++index < playlist.urls.length ? index : index = 0));
					}
				}
				else { // The user queued songs already
					index = this.upcoming.pop();
				}
				this.recent.push(index); // Add to the recent queue
				this.playing = playlist.titles[index];
				if (YouTube.validateURL(playlist.urls[index])) { // It's a YouTube song
					this.readable = YouTube(playlist.urls[index], {filter: "audioonly"});
					callback(this.readable);
				}
				else {
					scResolve(playlist.urls[index], (song) => { // It's a SoundCloud song
						if (song) {
							this.readable = request.get(song.stream_url + "?client_id=" + config.soundcloud.clientID);
							callback(this.readable);
						}
					});
				}
			}
		}
	}
	
	queue(query, callback) { // Add a song to the upcoming song queue
		if (query) {
			var index = Number(query);
			if (index <= playlist.urls.length) { // It's a number
				if (index) {
					var title = playlist.titles[--index];
					if (this.upcoming.includes(index)) {
						callback(null, title, true);
					}
					else {
						this.upcoming.push(index);
						callback(null, title, false);
					}
				}
			}
			else { // Just let this.add handle the searching (why didn't I do that in this.play? I don't know)
				this.add(query, (title, exist) => {
					if (title) {
						this.queue(playlist.titles.indexOf(title) + 1, callback);
					}
				});
			}
		}
		else { // Return the songs in the queue (potential for being hosted on Gist)
			var response = [];
			for (var i = 0; i < this.upcoming.elems.length && response.join('\n').length + 7 < 2000; ++i) {
				response.push(playlist.titles[this.upcoming.elems[i]]);
			}
			if (response.join('\n').length + 7 >= 2000) {
				response.pop();
			}
			callback("```\n" + response.join('\n') + "```");
		}
	}
	
	dequeue(query) { // Remove a song from the upcoming queue
		var index = Number(query), title;
		if (index <= playlist.urls.length) { // It's a number
			if (index) {
				--index;
				if (this.upcoming.includes(index)) {
					title = playlist.titles[index];
					this.upcoming.elems.splice(this.upcoming.elems.indexOf(index), 1);
				}
			}
		}
		else {
			var s, current = 0;
			for (var i = 0; i < playlist.titles.length; ++i) { // Check titles
				s = similarity(query, playlist.titles[i]);
				if (s >= config.similarityReq.playlist && s > current) {
					index = i;
					current = s;
				}
			}
			if (index) { // Found it
				return this.dequeue(index + 1);
			}
		}
		return title;
	}
	
	next(query, callback) { // Add a song to the front of the upcoming queue
		var index = Number(query), title;
		if (index <= playlist.urls.length) { // Number (man, I am tired)
			if (index) {
				--index;
				if (this.upcoming.includes(index)) {
					this.upcoming.elems.splice(this.upcoming.elems.indexOf(index), 1);
				}
				this.upcoming.elems.unshift(index);
				title = playlist.titles[index];
			}
			callback(title);
		}
		else {
			this.add(query, (title, exist) => { // Let this.add handle it again
				if (title) {
					this.next(playlist.titles.indexOf(title) + 1, callback);
				}
			});
		}
	}
	
	skip(callback) { // Skip the currently playing song
		if (playlist.urls.length && this.playing) { // Needs to actually be playing a song
			var index;
			if (!this.upcoming.empty()) { // Is there a queued song?
				index = this.upcoming.pop();
				if (this.recent.includes(index)) {
					this.recent.elems.splice(this.recent.elems.indexOf(index), 1);
				}
			}
			else { // No queued song here
				if (config.music.shuffle) { // Shuffle on
					index = Math.floor(Math.random() * playlist.urls.length);
					if (playlist.urls.length > 10) {
						--index;
						while (this.recent.includes(++index < playlist.urls.length ? index : index = 0));
					}
				}
				else { // Shuffle off
					if ((index = playlist.titles.indexOf(this.playing) + 1) >= playlist.titles.length) {
						index = 0;
					}
					if (this.recent.includes(index)) {
						this.recent.elems.splice(this.recent.elems.indexOf(index), 1);
					}
				}
			}
			this.recent.push(index);
			this.playing = playlist.titles[index];
			if (YouTube.validateURL(playlist.urls[index])) { // YouTube
				this.readable = YouTube(playlist.urls[index], {filter: "audioonly"});
				callback(this.readable);
			}
			else {
				scResolve(playlist.urls[index], (song) => { // SoundCloud
					if (song) {
						this.readable = request.get(song.stream_url + "?client_id=" + config.soundcloud.clientID);
						callback(this.readable);
					}
				});
			}
		}
	}
	
	url() { // Returns the url of the currently playing song
		if (this.playing) {
			return playlist.urls[playlist.titles.indexOf(this.playing)];
		}
	}
}
