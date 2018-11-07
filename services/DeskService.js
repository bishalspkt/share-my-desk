"use strict";

const moment = require("moment");
const mongoose = require("mongoose");
const utils = require("../lib/utils");
const errcodes = require("../lib/constants").ErrorCodes();
const officeLocations = require("./OfficeLocationsService").getOfficeLocations();

// How many days into the future can a desk be shared. 
const canShareForDaysInFuture = utils.getConfig("CAN_SHARE_FOR_DAYS_IN_FUTURE", 60);

exports.DeskService = (availableDeskModel, userModel) => {
    if (utils.isNull(availableDeskModel)) {
        availableDeskModel = require("../models/AvailableDesk");
    }
    if (utils.isNull(userModel)) {
        userModel = require("../models/User");
    }

    const instance = {}

    instance.share = (deskDetails, userId, cb) => {
        // Check if known officeLocation is passed in
        if(officeLocations.map(office => office.location).indexOf(deskDetails.officeLocation) == -1) {
            return cb(errcodes.INVALID_OFFICE_LOCATION);
        }

        // Check if the dates being passed in were valid
        const datesAvailable = moment(deskDetails.datesAvailable)
        const today = moment().startOf('day');
        const lastValidDay = today.add(canShareForDaysInFuture, 'days');
        for (var i = 0; i < datesAvailable.length; i++) {
            var momentDate = moment(datesAvailable[i], "YYYYMMDD");
            if (!momentDate.isValid()) {
                return cb(errcodes.INVALID_DATE_FORMAT);
            }
            if (momentDate.isBefore(today) || momentDate.isAfter(lastValidDay)) {
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
        });
        
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
            }
        })
        availableDeskModel.insertMany(insertObjects, (err, docs) => {
            if (utils.isNotNull(err)) {
                return cb(errcodes.DATABASE_ERROR);
            }
            return cb(null, {insertCount: docs.length});
        })
    };

    instance.getDesks = (query, cb) => {
        availableDeskModel.find(query, (err, desks) => {
            if(err) {
                return cb(errcodes.DATABASE_ERROR);
            }

            if(utils.isEmpty(desks)) {
                return cb(errcodes.NO_MATCH_FOUND);
            }
            console.log("DESKS", desks);
            cb(null, { desks: desks });
        })
    };

    return instance;
}