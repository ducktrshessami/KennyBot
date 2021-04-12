const { createHash } = require("crypto");

module.exports = function (buffer) {
    return createHash("sha256")
        .update(buffer)
        .update(process.env.HASH_SALT)
        .digest("hex");
};
