"use strict";

const moment = require("moment");
const mongoose = require("mongoose");
const utils = require("../lib/utils");
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


exports.DeskService = (availableDeskModel, userModel) => {
    if (utils.isNull(availableDeskModel)) {
        availableDeskModel = require("../models/AvailableDesk");
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
        const searchObject = {
            officeLocation: deskDetails.officeLocation,
            deskNumber: deskDetails.deskNumber,
            date: { $in:  deskDetails.datesAvailable }
        };
        availableDeskModel.find(searchObject, (err, desks) => {
            if (utils.isNotNull(err)) {
                return cb(errcodes.DATABASE_ERROR);
            }
            if (!utils.isEmpty(desks)) {
                // Exisiting share with the same details found
                return cb(errcodes.DESK_ALREADY_SHARED);
            }

            // Flatten the deskDetails to one record per date
            const postedBy = mongoose.Types.ObjectId(userId);
            const insertObjects = deskDetails.datesAvailable.map(date => {
                return {
                    date: date,
                    officeLocation: deskDetails.officeLocation,
                    deskNumber: deskDetails.deskNumber,
                    notes: deskDetails.notes,
                    directions: deskDetails.directions,
                    closestRoomName: deskDetails.closestRoomName,
                    postedBy: postedBy
                };
            });
            availableDeskModel.insertMany(insertObjects, (err, docs) => {
                if (utils.isNotNull(err)) {
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

        availableDeskModel.
            find(query).
            populate("postedBy").
            exec((err, _desks) => {
                if (err) {
                    return cb(errcodes.DATABASE_ERROR);
                }

                if (utils.isEmpty(_desks)) {
                    return cb(errcodes.NO_MATCH_FOUND);
                }

                // Return only the relevant information
                let desks = createDeskResponse(_desks);
                cb(null, { desks: desks });
            });
    };

    /**
     * Maps mongoose returned raw desks array to minimal desk details needed by the client
     * @param {[AvailableDesk]} mongooseDesks returned from database
     */
    const createDeskResponse = (mongooseDesks) => {
        return mongooseDesks.map(_desk => {
            return {
                directions: _desk.directions,
                notes: _desk.notes,
                closestRoomName: _desk.closestRoomName,
                isAvailable: utils.isNull(_desk.bookedBy),
                availableDeskId: _desk._id,
                date: _desk.date,
                officeLocation: _desk.officeLocation,
                deskNumber: _desk.deskNumber,
                postedBy: {
                    name: _desk.postedBy.name,
                    email: _desk.postedBy.email
                },
                postedOn: _desk.updatedAt

            };
        });
    };
    return instance;
};

// Exporting for testability
exports.parseDateString = parseDateString;
exports.isDateBeforeToday = isDateBeforeToday;
exports.isDateWithinAllowedFuture = isDateWithinAllowedFuture;
exports.isDateInValidRange = isDateInValidRange;