"use strict";

const winston = require("winston");
const utils = require("./utils");

/**
 * Uses winston package to create a logger
 */
module.exports = winston.createLogger({
    level: utils.getConfig("LOG_LEVEL", "info"),
    format: winston.format.combine(
        winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        winston.format.printf(info => {
            return `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`;
        })
    ),
    transports: [new winston.transports.Console()]
});