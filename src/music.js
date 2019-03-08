const jsonfile = require("jsonfile"); // File I/O
const stringSimilarity = require('string-similarity'); // String comparison
const request = require("request"); // HTTP requests
const rp = require("request-promise"); // Request except with promises
const ytdl = require("ytdl-core"); // Solely for YouTube URL parsing
const gists = require("gists"); // Gist hosted playlist
const Queue = require("./queue"); // Last played queue
const config = require("../config.json"); // Music and search engine config
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

function getBestMatch(query, set) { // Keyword based string searching
	return set.map((element) => {
		var keywords = [], test = element.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ');
		query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ').forEach((a) => { // Find keywords
			var index = test.findIndex((b) => {
				return stringSimilarity.compareTwoStrings(a, b) >= 0.8; // Threshold
			});
			if (index != -1) {
				keywords.push(test.splice(index, 1)); // Target acquired
			}
		});
		return { // Using the same format as string-similarity's bestMatch for simplicity
			target: element,
			rating: stringSimilarity.compareTwoStrings(query, keywords.join(' '))
		};
	}).sort((a, b) => { // Sort to find the best one
		return b.rating - a.rating;
	})[0];
}

module.exports = class Music {
	constructor(guild) { // Initialize variables
		this.guild = guild;
		this.playing = null;
		this.readable = null;
		this.upcoming = new Queue();
		this.backup = null;
		if (!playlist[guild]) { // Initialize new guild
			playlist[guild] = {
				titles: [],
				urls: []
			};
		}
		this.recent = new Queue(Math.floor(playlist[this.guild].urls.length * 0.75));
		this.update();
	}
	
	update() { // Update playlist.json and Gist playlist
		for (var i = 0; i < playlist[this.guild].titles.length; ++i) { // Get rid of null entries that I never debugged lol
			if (!playlist[this.guild].titles[i] || !playlist[this.guild].urls[i]) {
				playlist[this.guild].titles.splice(i, 1);
				playlist[this.guild].urls.splice(i, 1);
			}
		}
		this.recent.length = Math.floor(playlist[this.guild].urls.length * 0.75); // Resize recent playlist
		jsonfile.writeFile("../playlist.json", playlist, {spaces: 4}).catch(console.log);
		gist.list(config.gist.username).then((response) => { // Post to Gist
			var gs = [], options = {
				description: this.guild,
				public: false,
				files: {}
			};
			options.files[this.guild] = {
				content: playlist[this.guild].titles.length == 0 ? "Playlist is empty. Try adding some songs with the 'add' command.\n" : playlist[this.guild].titles.join('\n') + "\n"
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
					content: playlist[this.guild].titles.join('\n') + "\n"
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
		playlist = require("../playlist.json");
		return new Promise((resolve, reject) => {
			var index;
			if (ytdl.validateURL(query)) { // Is a YouTube URL?
				var videoID = ytdl.getURLVideoID(query);
				index = playlist[this.guild].urls.findIndex((element) => { // Check if already in playlist
					return ytdl.getURLVideoID(element) == videoID;
				});
				if (index == -1) { // Not in playlist yet
					ytdl.getBasicInfo(query).then((info) => { // Get video title
						playlist[this.guild].urls.push("https://youtube.com/watch?v=" + videoID);
						playlist[this.guild].titles.push(info.title);
						this.update();
						resolve({
							title: info.title,
							exist: false
						});
					}).catch(reject);
				}
				else {
					resolve({ // Already in playlist
						title: playlist[this.guild].titles[index],
						exist: true
					});
				}
			}
			else {
				scResolve(query).then((data) => { // Is a SoundCloud URL?
					if ((index = playlist[this.guild].urls.indexOf(data.permalink_url)) == -1) { // Check if already in playlist
						playlist[this.guild].urls.push(data.permalink_url);
						playlist[this.guild].titles.push(data.title);
						this.update();
						resolve({
							title: data.title,
							exist: false
						});
					}
					else {
						resolve({ // Already in playlist
							title: playlist[this.guild].titles[index],
							exist: true
						});
					}
				}).catch(() => { // Just a search query
					var best = playlist[this.guild].titles.length > 0 ? getBestMatch(query, playlist[this.guild].titles) : { // Check if already in playlist
						target: null,
						rating: 0
					};
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
							best = getBestMatch(query, itemTitles); // Find the best result
							if (best.rating >= config.similarityReq) {
								var link = items[itemTitles.indexOf(best.target)].link;
								if (ytdl.validateURL(link)) { // Is a YouTube video?
									ytdl.getBasicInfo(link).then((info) => { // Get video title
										playlist[this.guild].urls.push("https://youtube.com/watch?v=" + ytdl.getURLVideoID(link));
										playlist[this.guild].titles.push(info.title);
										this.update();
										resolve({
											title: info.title,
											exist: false
										});
									}).catch(reject);
								}
								else {
									scResolve(link).then((data) => { // Is a SoundCloud song?
										playlist[this.guild].urls.push(data.permalink_url);
										playlist[this.guild].titles.push(data.title);
										this.update();
										resolve({
											title: data.title,
											exist: false
										});
									}).catch(() => {
										resolve({}); // Failure
									});
								}
							}
							else {
								resolve({}); // Failure
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
				return playlist[this.guild].titles[element];
			}),
			upcoming: this.upcoming.elems.map((element) => {
				return playlist[this.guild].titles[element];
			})
		};
	}
	
	after() { // Helper for before()
		if (this.backup) {
			this.recent.elems = this.backup.recent.map((element) => {
				return playlist[this.guild].titles.indexOf(element);
			});
			this.upcoming.elems = this.backup.upcoming.map((element) => {
				return playlist[this.guild].titles.indexOf(element);
			});
			this.backup = null;
		}
	}
	
	remove(query) { // Remove a song from the playlist
		playlist = require("../playlist.json");
		return new Promise((resolve, reject) => {
			var index = Math.floor(Number(query)), title;
			if (index > 0 && index <= playlist[this.guild].urls.length) { // It's a number
				--index;
				this.before(index);
				title = playlist[this.guild].titles.splice(index, 1)[0];
				playlist[this.guild].urls.splice(index, 1);
				this.after();
				this.update();
				resolve(title);
			}
			else {
				if (ytdl.validateURL(query)) { // Is a YouTube URl?
					var videoID = ytdl.getURLVideoID(query);
					index = playlist[this.guild].urls.findIndex((element) => {
						return ytdl.getURLVideoID(element) == videoID;
					});
					if (index != -1) { // Found it
						this.before(index);
						title = playlist[this.guild].titles.splice(index, 1)[0];
						playlist[this.guild].urls.splice(index, 1);
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
						if (playlist[this.guild].urls.includes(data.permalink_url)) {
							index = playlist[this.guild].urls.indexOf(data.permalink_url);
							this.before(index);
							title = playlist[this.guild].titles.splice(index, 1)[0];
							playlist[this.guild].urls.splice(index, 1);
							this.after();
							this.update();
							resolve(title);
						}
						else {
							resolve(); //Failure
						}
					}).catch(() => { // It's a search query
						var best = getBestMatch(query, playlist[this.guild].titles);
						if (best.rating >= config.similarityReq) { // Found it
							index = playlist[this.guild].titles.indexOf(best.target);
							this.before(index);
							title = playlist[this.guild].titles.splice(index, 1)[0];
							playlist[this.guild].urls.splice(index, 1);
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
	
	play(shuffle, query) { // Play a song, add it the playlist if need be
		return new Promise((resolve, reject) => {
			this.next(query).then(() => {
				this.skip(shuffle).then(resolve).catch(reject); // Let skip() handle the streaming
			}).catch(reject);
		});
	}
	
	queue(query) { // Add a song to the upcoming song queue
		return new Promise((resolve, reject) => {
			if (query) { // Add a song to the queue
				var index = Math.floor(Number(query));
				if (index > 0 && index <= playlist[this.guild].urls.length) { // It's a number
					--index;
					if (!this.upcoming.includes(index)) {
						this.upcoming.push(index);
						resolve(playlist[this.guild].titles[index], false); // Success
					}
					else {
						resolve(playlist[this.guild].titles[index], true); // Already in queue
					}
				}
				else {
					this.add(query).then((response) => {
						if (response.title) {
							index = playlist[this.guild].titles.indexOf(response.title);
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
					return playlist[this.guild].titles[element];
				}));
			}
		});
	}
	
	dequeue(query) { // Remove a song from the upcoming queue
		var index = Math.floor(Number(query)), title;
		if (index > 0 && index <= playlist[this.guild].urls.length) { // It's a number
			--index;
			if (this.upcoming.includes(index)) {
				title = playlist[this.guild].titles[index];
				this.upcoming.elems.splice(this.upcoming.elems.indexOf(index), 1);
				return title;
			}
		}
		else { // It's a search query
			var best = getBestMatch(query, playlist[this.guild].titles);
			if (best.rating >= config.similarityReq) {
				return this.dequeue(playlist[this.guild].titles.indexOf(best.target) + 1); // Recurse with number
			}
		}
	}
	
	next(query) { // Add a song to the front of the upcoming queue
		return new Promise((resolve, reject) => {
			var index = Math.floor(Number(query));
			if (index > 0 && index <= playlist[this.guild].urls.length) { // It's a number
				--index;
				this.upcoming.elems = this.upcoming.elems.filter((element) => { // Get rid of dupes
					return element != index;
				});
				this.upcoming.elems.unshift(index);
				resolve(playlist[this.guild].titles[index]);
			}
			else {
				this.add(query).then((response) => { // Let add() handle the query
					if (response.title) {
						index = playlist[this.guild].titles.indexOf(response.title);
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
	
	skip(shuffle) { // Skip the currently playing song
		return new Promise((resolve, reject) => {
			if (playlist[this.guild].urls.length) {
				var index;
				if (this.upcoming.empty()) { // Upcoming songs not specified
					if (shuffle || !this.playing) {
						var foo = playlist[this.guild].urls.filter((element, i) => { // Deal with recently played songs
							return !this.recent.includes(i);
						});
						index = playlist[this.guild].urls.indexOf(foo[Math.floor(Math.random() * foo.length)]);
					}
					else {
						if ((index = playlist[this.guild].titles.indexOf(this.playing) + 1) >= playlist[this.guild].titles.length) { // Pick next song in playlist
							index = 0;
						}
					}
				}
				else {
					index = this.upcoming.pop(); // Pull from the upcoming queue
				}
				this.playing = playlist[this.guild].titles[index];
				this.recent.elems = this.recent.elems.filter((element) => { // No dupes in the recent queue
					return element != index;
				});
				this.recent.push(index); // Put in the recent queue
				if (ytdl.validateURL(playlist[this.guild].urls[index])) { // Is a YouTube URL?
					this.readable = ytdl(playlist[this.guild].urls[index], {filter: "audio"}).on("error", console.log);
					resolve(this.readable); // Success
				}
				else {
					scResolve(playlist[this.guild].urls[index]).then((data) => { // Is a SoundCloud URL?
						this.readable = request.get(data.stream_url + (data.stream_url.includes('?') ? "&" : "?") + "client_id=" + config.soundcloud.clientID).on("error", console.log);
						resolve(this.readable); // Success
					}).catch((error) => {
						reject("URL could not be resolved: " + playlist[this.guild].urls[index]);
					});
				}
			}
			else {
				resolve(); // Playlist is empty
			}
		});
	}
	
	url(query) { // Returns the url of the currently playing song
		if (query) {
			var index = Math.floor(Number(query));
			if (index > 0 && index <= playlist[this.guild].urls.length) { // It's a number
				return playlist[this.guild].urls[--index];
			}
			else {
				var best = getBestMatch(query, playlist[this.guild].titles); // Use search query
				if (best.rating >= config.similarityReq) {
					return playlist[this.guild].urls[playlist[this.guild].titles.indexOf(best.target)];
				}
			}
		}
		else if (this.playing) {
			return playlist[this.guild].urls[playlist[this.guild].titles.indexOf(this.playing)];
		}
	}
}
