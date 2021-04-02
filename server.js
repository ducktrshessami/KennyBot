try {
    require("dotenv").config();
}
catch {
    console.warn("Not using dotenv. Make sure environment variables are set");
}

process.bot = require("./bot");
process.api = require("./api");
process.ios = require("./ios");

function failed() {
    process.exit();
}

process.bot.on("ready", () => {
    process.bot.off("error", failed);
});

process.bot.on("error", failed);
