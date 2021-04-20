const { Router } = require("express");
const fs = require("fs");
const path = require("path");

const router = Router();
const basename = path.basename(__filename);

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        require(path.join(__dirname, file))(router);
    });

module.exports = router;
