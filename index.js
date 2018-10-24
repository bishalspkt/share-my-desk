"use strict";

const async = require("async");
const utils = require("./lib/utils");
const logger = require("./lib/logger");

utils.assertNodeRuntime();

const installRAML = (cb) => {
    cb(null);
};

async.series([
    installRAML
], (err) => {
    if (err) {
        logger.error(err.message);
        logger.error(err.stack);
        process.exit(1);
    }
});