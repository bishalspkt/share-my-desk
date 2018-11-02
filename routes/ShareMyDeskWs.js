"use strict";

const webUtils = require("../lib/webUtils");
const logger = require("../lib/logger");


const shareMyDesk = (req, res) => {
    webUtils.sendSuccess(res, { user: req.user });
};

exports.install = (server) => {
    const bodyValidatorMiddleware = webUtils.getBodyValidatorMiddleware();
    server.post(server.getPath("/shareMyDesk"), bodyValidatorMiddleware, shareMyDesk);
    logger.info("shareMyDesk installed at " + server.getPath("/shareMyDesk"));
};