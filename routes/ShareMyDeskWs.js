"use strict";

const httpResponseTemplates = require("../lib/httpResponseTemplates");
const logger = require("../lib/logger");


const shareMyDesk = (req, res) => {
    httpResponseTemplates.sendSuccess(res, {user: req.user, session: req.session});
};

exports.install = (server) => {
    server.post(server.getPath("/shareMyDesk"), shareMyDesk);
    logger.info("shareMyDesk installed at " + server.getPath("/shareMyDesk"));
};