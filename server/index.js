const http = require("http");
const ws = require("./ws");

const PORT = process.env.PORT || 3001;
const app = require("./http");
const server = http.createServer(app);

ws(server);

module.exports = server.listen(PORT, function () {
    console.log(`API listening on PORT ${PORT}`);
    if (!process.env.API_NOCYCLE || (process.env.API_NOCYCLE || "").trim().toLowerCase() === "false") {
        app.cycler.startLoop();
    }
});
