const { createHash } = require("crypto");

module.exports = function (buffer) {
    return createHash("sha256")
        .update(buffer)
        .digest("hex");
};
