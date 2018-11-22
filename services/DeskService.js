"use strict";

const moment = require("moment");
const utils = require("../lib/utils");
const logger = require("../lib/logger");
const errcodes = require("../lib/constants").ErrorCodes();
const officeLocations = require("./OfficeLocationsService").getOfficeLocations();

// How many days into the future can a desk be shared.
const canShareForDaysInFuture = utils.getConfig("CAN_SHARE_FOR_DAYS_IN_FUTURE", 60);

/**
 * parses a string for a valid date
 * @param {String} dateString of format YYYYMMDD
 * @returns {Moment} date or null
 */
const parseDateString = (dateString) => {
    var momentDate = moment(dateString, "YYYYMMDD");
    return momentDate.isValid() ? momentDate : null;
};
/**
 * Check if the moment date is before today
 * @param {Moment} dateToTest
 * @returns {Boolean}
 */
const isDateBeforeToday = (dateToTest) => dateToTest.isBefore(moment().startOf("day"));

/**
 * Check is the date is within the last allowed day in the future
 * @param {Moment} dateToTest
 * @returns {Boolean}
 */
const isDateWithinAllowedFuture = (dateToTest) => dateToTest.isBefore(moment().startOf("day").add(canShareForDaysInFuture + 1, "days"));

/**
 * Check is the date is within the date ranges allowed
 * Between today and last allowed day in the future
 * @param {Moment} dateToTest
 * @returns {Boolean}
 */
const isDateInValidRange = (dateToTest) => !isDateBeforeToday(dateToTest) && isDateWithinAllowedFuture(dateToTest);


exports.DeskService = (deskModel, userModel) => {
    if (utils.isNull(deskModel)) {
        deskModel = require("../models/Desk");
    }
    if (utils.isNull(userModel)) {
        userModel = require("../models/User");
    }

    const instance = {};

    instance.share = (deskDetails, userId, cb) => {
        // Check if known officeLocation is passed in
        if (officeLocations.map(office => office.location).indexOf(deskDetails.officeLocation) == -1) {
            return cb(errcodes.INVALID_OFFICE_LOCATION);
        }

        // Check if the dates being passed in were valid
        for (var i = 0; i < deskDetails.datesAvailable.length; i++) {

            var momentDate = parseDateString(deskDetails.datesAvailable[i]);
            if (utils.isNull(momentDate)) {
                return cb(errcodes.INVALID_DATE_FORMAT);
            }

            if (!isDateInValidRange(momentDate)) {
                return cb(errcodes.DATE_NOT_IN_VALID_RANGE);
            }
        }

        // Check if the desk is already shared for the date selected
        deskModel.isDeskAlreadyShared(deskDetails.deskNumber, deskDetails.officeLocation, deskDetails.datesAvailable, (err, isDeskShared) => {
            if (utils.isNotNull(err)) {
                logger.error(err);
                return cb(errcodes.DATABASE_ERROR);
            }
            if (isDeskShared) {
                // Exisiting share with the same details found
                return cb(errcodes.DESK_ALREADY_SHARED);
            }
            const desk = {
                officeLocation: deskDetails.officeLocation,
                deskNumber: deskDetails.deskNumber,
                notes: deskDetails.notes,
                directions: deskDetails.directions,
                closestRoomName: deskDetails.closestRoomName,
                postedBy: userId
            };

            deskModel.insertDesk(desk, deskDetails.datesAvailable, (err, docs) => {
                if (utils.isNotNull(err)) {
                    logger.error(err);
                    return cb(errcodes.DATABASE_ERROR);
                }
                return cb(null, {insertCount: docs.length});
            });
        });


    };

    instance.getDesks = (query, cb) => {
        // Validate query parameters
        if (officeLocations.map(office => office.location).indexOf(query.officeLocation) == -1) {
            return cb(errcodes.INVALID_OFFICE_LOCATION);
        }

        var momentDate = parseDateString(query.date);
        if (utils.isNull(momentDate)) {
            return cb(errcodes.INVALID_DATE_FORMAT);
        }
        if (isDateBeforeToday(momentDate)) {
            return cb(errcodes.DATE_NOT_IN_VALID_RANGE);
        }
        // TODO: Determine how farther into the future are searches allowed.
        deskModel.findDesks(query, (err, desks) => {
            if (err) {
                logger.error(err);
                return cb(errcodes.DATABASE_ERROR);
            }

            if (utils.isEmpty(desks)) {
                return cb(errcodes.NO_DESK_FOUND);
            }

            cb(null, { desks: desks });
        });
    };

    return instance;
};

// Exporting for testability
exports.parseDateString = parseDateString;
exports.isDateBeforeToday = isDateBeforeToday;
exports.isDateWithinAllowedFuture = isDateWithinAllowedFuture;
exports.isDateInValidRange = isDateInValidRange;