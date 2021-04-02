try {
    require("dotenv").config();
}
catch {
    console.warn("Not using dotenv. Make sure environment variables are set");
}

const db = require("./models");

db.sequelize.sync({ force: process.env.DB_FORCE && process.env.DB_FORCE.trim().toLowerCase() !== "false" })
    .then(() => {
        process.bot = require("./bot");
        process.api = require("./api");

        function failed() {
            process.exit();
        }

        process.bot.on("ready", () => {
            process.bot.off("error", failed);
        });

        process.bot.on("error", failed);
    })
    .catch(err => {
        console.error(err);
        process.exit();
    });
