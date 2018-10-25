"use strict";

var db = require("../lib/db");

const userSchema = new db.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    accountInfo: {
        secret: String,
        secret_expires: Date,
    }
}, {timestamps: true});

module.exports = db.model("User", userSchema);