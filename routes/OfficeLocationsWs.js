"use strict";

const webUtils = require("../lib/webUtils");

const officeLocationsService = require("../services/OfficeLocationsService");

const getOfficeLocations = (req, res) => {
    webUtils.sendSuccess(res, officeLocationsService.getOfficeLocations());
};

exports.install = (server) => {
    server.get(server.getPath("/getOfficeLocations"), getOfficeLocations);
};