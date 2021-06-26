try {
    require("dotenv").config();
}
catch {
    console.warn("Not using dotenv. Make sure environment variables are set");
}

const db = require("./models");

// Sync database before anything else
db.sequelize.sync({ force: process.env.DB_FORCE && process.env.DB_FORCE.trim().toLowerCase() !== "false" })
    .then(() => {
        function failed() {
            process.exit();
        }

        // Connect to Discord before start web server
        process.bot = require("./bot");

        process.bot.on("ready", () => {
            process.bot.off("error", failed);
            process.server = require("./server");
        });

        process.bot.on("error", failed);
    })
    .catch(err => {
        console.error(err);
        process.exit();
    });
