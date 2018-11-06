"use strict";

const db = require("../lib/db");
const ObjectId = db.Schema.Types.ObjectId;

//User schema to hold user information
const availableDeskSchema = new db.Schema({
    postedBy: {
        type: ObjectId,
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
        required: false,
        default: null
    }
}, {timestamps: true});

module.exports = db.model("Availabledesk", availableDeskSchema);