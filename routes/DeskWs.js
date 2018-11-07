"use strict";

const utils = require("../lib/utils");
const webUtils = require("../lib/webUtils");
const logger = require("../lib/logger");
const shareMyDeskService = require("../services/DeskService.js").DeskService();

const shareMyDesk = (req, res) => {
    const deskDetails = {
        datesAvailable: req.body.datesAvailable,
        officeLocation: req.body.officeLocation,
        deskNumber: req.body.deskNumber,
        notes: req.body.notes,
        directions: req.body.directions,
        closestRoomName: req.body.closestRoomName
    }

    const userId = req.user.sub;
    // Try entering without validation
    shareMyDeskService.share(deskDetails, userId, (ERRCODE, responseObject) => {
        if (utils.isNotNull(ERRCODE)) {
            return webUtils.sendFailure(res, ERRCODE);
        }
        return webUtils.sendSuccess(res, responseObject);
    });
};

const getAvailableDesks = (req, res) => {
    const query = {
        officeLocation: req.query.officeLocation,
        date: req.query.date
    };
    shareMyDeskService.getDesks(query, (ERRCODE, responseObject) => {
        if (utils.isNotNull(ERRCODE)) {
            return webUtils.sendFailure(res, ERRCODE);
        }
        return webUtils.sendSuccess(res, responseObject);
    });
}

exports.install = (server) => {
    const shareValidatorMiddleware = webUtils.getBodyValidatorMiddleware(["datesAvailable", "deskNumber", "officeLocation"]);
    const getDesksValidatorMiddleware = webUtils.getQueryValidatorMiddleware(["date", "officeLocation"]);

    server.post(server.getPath("/shareMyDesk"), shareValidatorMiddleware, shareMyDesk);
    server.get(server.getPath("/getAvailableDesks"), getDesksValidatorMiddleware, getAvailableDesks);

    logger.info("Desk web service installed");
};