"use strict";

const utils = require("../lib/utils");
const logger = require("../lib/logger");
const httpResponseTemplates = require("../lib/httpResponseTemplates");

const officeLocationsService = require("../services/OfficeLocationsService");

const getOfficeLocations = (req, res) => {
    httpResponseTemplates.sendSuccess(res, officeLocationsService.getOfficeLocations());
};

exports.install = (server) => {
    server.get(server.getPath("/getOfficeLocations"), getOfficeLocations);
};