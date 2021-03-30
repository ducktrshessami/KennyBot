const { Octokit } = require("@octokit/rest");

let client = new Octokit();

// Set personal access token
module.exports.setToken = function(token) {
    client = new Octokit({ auth: token });
}
