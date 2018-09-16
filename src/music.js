const file = require("fs"); // File I/O
const stringSimilarity = require('string-similarity'); // String comparison
const request = require("request"); // HTTP requests
const rp = require("request-promise"); // Request except with promises
const YouTube = require("ytdl-core"); // YouTube streaming
const gists = require("gists"); // Gist hosted playlist
const Queue = require("./queue"); // Last played queue
var config = require("../config.json"); // Music and search engine config
var playlist = require("../playlist.json"); // List of songs

const gist = new gists({ // Log in to Gist
	username: config.gist.username,
	password: config.gist.password
});

function google(query) { // CSE search
	return new Promise((resolve, reject) => {
		rp.get("https://www.googleapis.com/customsearch/v1?key=" + config.CSE.apikey + "&cx=" + config.CSE.engineID + "&safe=" + (config.CSE.safe ? "active" : "off") + "&q=" + query, {json: true}).then((data) => {
			resolve(data.items);
		}).catch(reject);
	});
}

function scResolve(url) { // SoundCloud API call
	return new Promise((resolve, reject) => {
		rp.get("http://api.soundcloud.com/resolve?client_id=" + config.soundcloud.clientID + "&url=" + url, {json: true}).then((data) => {
			if (data.errors) {
				reject(data.errors);
			}
			else {
				if (data.kind == "track") {
					resolve(data);
				}
				else {
					reject("URL is for a " + data.kind);
				}
			}
		}).catch(reject);
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
	
	list() { // Get Gist playlist URL
		return new Promise((resolve, reject) => {
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
					resolve(gs[0].html_url);
				}
				else {
					gs.forEach((g) => { // Delete dupes (still precautionary)
						gist.delete(g.id);
					});
					gist.create(options).then((response) => { // Create correct one
						resolve(response.body.html_url);
					}).catch(reject);
				}
			}).catch(reject);
		});
	}
	
	add(query) { // Add a song to the playlist
		return new Promise((resolve, reject) => {
			var index;
			if (YouTube.validateURL(query)) { // Is a YouTube URL?
				var videoID = YouTube.getURLVideoID(query);
				index = playlist.urls.findIndex((element) => { // Check if already in playlist
					return YouTube.getURLVideoID(element) == videoID;
				});
				if (index == -1) { // Not in playlist yet
					YouTube.getBasicInfo(query).then((info) => { // Get video title
						playlist.urls.push("https://youtube.com/watch?v=" + videoID);
						playlist.titles.push(info.title);
						this.update();
						resolve({
							title: info.title,
							exist: false
						});
					}).catch(reject);
				}
				else {
					resolve({ // Already in playlist
						title: playlist.titles[index],
						exist: true
					});
				}
			}
			else {
				scResolve(query).then((data) => { // Is a SoundCloud URL?
					if ((index = playlist.urls.indexOf(data.permalink_url)) == -1) { // Check if already in playlist
						playlist.urls.push(data.permalink_url);
						playlist.titles.push(data.title);
						this.update();
						resolve({
							title: data.title,
							exist: false
						});
					}
					else {
						resolve({ // Already in playlist
							title: playlist.titles[index],
							exist: true
						});
					}
				}).catch(() => { // Just a search query
					var best = stringSimilarity.findBestMatch(query, playlist.titles).bestMatch; // Check if already in playlist
					if (best.rating >= config.similarityReq) {
						resolve({ // Already in playlist
							title: best.target,
							exist: true
						});
					}
					else {
						google(query).then((items) => { // CSE time
							var itemTitles = items.map((item) => {
								return item.title;
							});
							best = stringSimilarity.findBestMatch(query, itemTitles).bestMatch; // Find the best result
							if (best.rating >= config.similarityReq) {
								var link = items[itemTitles.indexOf(best.target)].link;
								if (YouTube.validateURL(link)) { // Is a YouTube video?
									YouTube.getBasicInfo(link).then((info) => { // Get video title
										playlist.urls.push("https://youtube.com/watch?v=" + YouTube.getURLVideoID(link));
										playlist.titles.push(info.title);
										this.update();
										resolve({
											title: info.title,
											exist: false
										});
									}).catch(reject);
								}
								else {
									scResolve(link).then((data) => { // Is a SoundCloud song?
										playlist.urls.push(data.permalink_url);
										playlist.titles.push(data.title);
										this.update();
										resolve({
											title: data.title,
											exist: false
										});
									}).catch(() => {
										resolve(); // Failure
									});
								}
							}
							else {
								resolve(); // Failure
							}
						}).catch(reject);
					}
				});
			}
		});
	}
	
	before(index) { // Helper for remove() that handles changes in indices while playing music
		this.recent.elems = this.recent.elems.filter((element) => {
			return element != index;
		});
		this.upcoming.elems = this.upcoming.elems.filter((element) => {
			return element != index;
		});
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
		return new Promise((resolve, reject) => {
			var index = Number(query), title;
			if (index > 0 && index <= playlist.urls.length) { // It's a number
				--index;
				this.before(index);
				title = playlist.titles.splice(index, 1)[0];
				playlist.urls.splice(index, 1);
				this.after();
				this.update();
				resolve(title);
			}
			else {
				if (YouTube.validateURL(query)) { // Is a YouTube URl?
					var videoID = YouTube.getURLVideoID(query);
					index = playlist.urls.findIndex((element) => {
						return YouTube.getURLVideoID(element) == videoID;
					});
					if (index != -1) { // Found it
						this.before(index);
						title = playlist.titles.splice(index, 1)[0];
						playlist.urls.splice(index, 1);
						this.after();
						this.update();
						resolve(title);
					}
					else {
						resolve(); // Failure
					}
				}
				else {
					scResolve(query).then((data) => { // Is a SoundCloud URL?
						if (playlist.urls.includes(data.permalink_url)) {
							index = playlist.urls.indexOf(data.permalink_url);
							this.before(index);
							title = playlist.titles.splice(index, 1)[0];
							playlist.urls.splice(index, 1);
							this.after();
							this.update();
							resolve(title);
						}
						else {
							resolve(); //Failure
						}
					}).catch(() => { // It's a search query
						var best = stringSimilarity.findBestMatch(query, playlist.titles).bestMatch;
						if (best.rating >= config.similarityReq) { // Found it
							index = playlist.titles.indexOf(best.target);
							this.before(index);
							title = playlist.titles.splice(index, 1)[0];
							playlist.urls.splice(index, 1);
							this.after();
							this.update();
							resolve(title);
						}
						else {
							resolve(); // Failure
						}
					});
				}
			}
		});
	}
	
	shuffle() { // Reacquire configuration
		config = require("../config.json"); // command.js already changed the setting
	}
	
	play(query) { // Play a song, add it the playlist if need be
		return new Promise((resolve, reject) => {
			this.next(query).then(() => {
				this.skip().then(resolve).catch(reject); // Let skip() handle the streaming
			}).catch(reject);
		});
	}
	
	queue(query) { // Add a song to the upcoming song queue
		return new Promise((resolve, reject) => {
			if (query) { // Add a song to the queue
				var index = Number(query);
				if (index > 0 && index <= playlist.urls.length) { // It's a number
					--index;
					if (!this.upcoming.includes(index)) {
						this.upcoming.push(index);
						resolve(playlist.titles[index], false); // Success
					}
					else {
						resolve(playlist.titles[index], true); // Already in queue
					}
				}
				else {
					this.add(query).then((response) => {
						if (response.title) {
							index = playlist.titles.indexOf(response.title);
							if (!this.upcoming.includes(index)) {
								this.upcoming.push(index);
								resolve(response.title, false); // Success
							}
							else {
								resolve(response.title, true); // Already in queue
							}
						}
						else {
							resolve(); // Failure
						}
					}).catch(reject);
				}
			}
			else { // Just get the titles of the songs in the queue
				resolve(this.upcoming.elems.map((element) => {
					return playlist.titles[element];
				}));
			}
		});
	}
	
	dequeue(query) { // Remove a song from the upcoming queue
		var index = Number(query), title;
		if (index > 0 && index <= playlist.urls.length) { // It's a number
			--index;
			if (this.upcoming.includes(index)) {
				title = playlist.titles[index];
				this.upcoming.elems.splice(this.upcoming.elems.indexOf(index), 1);
				return title;
			}
		}
		else { // It's a search query
			var best = stringSimilarity.findBestMatch(query, playlist.titles).bestMatch;
			if (best.rating >= config.similarityReq) {
				return this.dequeue(playlist.titles.indexOf(best.target) + 1); // Recurse with number
			}
		}
	}
	
	next(query) { // Add a song to the front of the upcoming queue
		return new Promise((resolve, reject) => {
			var index = Number(query);
			if (index > 0 && index <= playlist.urls.length) { // It's a number
				--index;
				this.upcoming.elems = this.upcoming.elems.filter((element) => { // Get rid of dupes
					return element != index;
				});
				this.upcoming.elems.unshift(index);
				resolve(playlist.titles[index]);
			}
			else {
				this.add(query).then((response) => { // Let add() handle the query
					if (response.title) {
						index = playlist.titles.indexOf(response.title);
						this.upcoming.elems = this.upcoming.elems.filter((element) => { // Get rid of dupes
							return element != index;
						});
						this.upcoming.elems.unshift(index);
						resolve(response.title);
					}
					else {
						resolve(); // Failure
					}
				}).catch(reject);
			}
		});
	}
	
	skip() { // Skip the currently playing song
		return new Promise((resolve, reject) => {
			if (playlist.urls.length) {
				var index;
				if (this.upcoming.empty()) { // Upcoming songs not specified
					if (config.music.shuffle || !this.playing) {
						index = Math.floor(Math.random() * playlist.urls.length) - 1;
						while (this.recent.includes(++index < playlist.urls.length ? index : index = 0)); // Deal with recently played songs
					}
					else {
						if ((index = playlist.titles.indexOf(this.playing) + 1) >= playlist.titles.length) { // Pick next song in playlist
							index = 0;
						}
					}
				}
				else {
					index = this.upcoming.pop(); // Pull from the upcoming queue
				}
				this.playing = playlist.titles[index];
				this.recent.elems = this.recent.elems.filter((element) => { // No dupes in the recent queue
					return element != index;
				});
				this.recent.push(index); // Put in the recent queue
				if (YouTube.validateURL(playlist.urls[index])) { // Is a YouTube URL?
					this.readable = YouTube(playlist.urls[index], {
						quality: "highestaudio",
						filter: "audioonly"
					}).on("error", reject);
					resolve(this.readable); // Success
				}
				else {
					scResolve(playlist.urls[index]).then((data) => { // Is a SoundCloud URL?
						this.readable = request.get(data.stream_url + "?client_id=" + config.soundcloud.clientID).on("error", reject);
						resolve(this.readable);
					}).catch((error) => {
						reject("URL could not be resolved");
					});
				}
			}
			else {
				resolve(); // Playlist is empty
			}
		});
	}
	
	url() { // Returns the url of the currently playing song
		if (this.playing) {
			return playlist.urls[playlist.titles.indexOf(this.playing)];
		}
	}
}
