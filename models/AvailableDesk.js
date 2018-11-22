"use strict";

const db = require("../lib/db");
const ModelNames = require("../lib/constants").ModelNames();
const ObjectId = db.Schema.Types.ObjectId;

//User schema to hold user information
const availableDeskSchema = new db.Schema({
    postedBy: {
        type: ObjectId,
        ref: ModelNames.USER_MODEL,
        required: true
    },
    date: {
        type: Number, // Save as string of format YYYYMMDD
        required: true,
    },
    officeLocation: {
        type: String,
        required: true
    },
    deskNumber: {
        type: String,
        required: true
    },
    directions: {
        type: String,
        required: false,
        default: null
    },
    notes: {
        type: String,
        required: false,
        default: null
    },
    closestRoomName: {
        type: String,
        required: false,
        default: null
    },
    bookedBy: {
        type: ObjectId,
        ref: ModelNames.USER_MODEL,
        required: false,
        default: null
    }
}, {timestamps: true});

const _availableDeskModel = db.model(ModelNames.AVAILABLE_DESK_MODEL, availableDeskSchema);

exports.insertDesk = (desk, dates, cb) => {
    // Unpack the desk
    const insertObjects = dates.map(date => Object.assign({date: date}, desk));
    _availableDeskModel.insertMany(insertObjects, cb);
};

exports.isDeskAlreadyShared = (deskNumber, officeLocation, proposedDates, cb) => {
    const query = {
        deskNumber: deskNumber,
        officeLocation: officeLocation,
        date: { $in : proposedDates }
    };
    _availableDeskModel.findOne(query).lean().exec((err, desk) => err ? cb(err) : cb(null, desk ? true : false));
};

exports.findDesks = (query, cb) => {
    _availableDeskModel.find(query).populate("postedBy").lean().exec((err, _desks) => {
        // remove
        if (err) {
            return cb(err);
        }
        const desks = _desks.map(_desk => {
            return {
                directions: _desk.directions,
                notes: _desk.notes,
                closestRoomName: _desk.closestRoomName,
                isAvailable: _desk.bookedBy == null,
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

        return cb(null, desks);
    });
};