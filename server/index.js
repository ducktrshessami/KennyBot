const { createServer } = require("http");
const http = require("./http");
const ws = require("./ws");
const session = require("./session");

const PORT = process.env.PORT || 3001;
const app = http(session);
const server = createServer(app);

ws(server, session.socket);

module.exports = server.listen(PORT, function () {
    console.log(`API listening on PORT ${PORT}`);
    if (!process.env.API_NOCYCLE || (process.env.API_NOCYCLE || "").trim().toLowerCase() === "false") {
        app.cycler.startLoop();
    }
});
