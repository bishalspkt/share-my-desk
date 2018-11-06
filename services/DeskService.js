"use strict";

const mongoose = require("mongoose");
const utils = require("../lib/utils");
const errcodes = require("../lib/constants").ErrorCodes();

exports.DeskService = (availableDeskModel, userModel) => {
    if (utils.isNull(availableDeskModel)) {
        availableDeskModel = require("../models/AvailableDesk");
    }
    if (utils.isNull(userModel)) {
        userModel = require("../models/User");
    }

    const instance = {}

    instance.share = (deskDetails, userId, cb) => {
        const availableDesk = availableDeskModel(deskDetails);
        availableDesk.postedBy = mongoose.Types.ObjectId(userId);
        availableDesk.save()
        cb(null, {});
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