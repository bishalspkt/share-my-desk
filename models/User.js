"use strict";

var db = require("../lib/db");
var ModelNames = require("../lib/constants").ModelNames();

//User schema to hold user information
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
    apiKeys: [{
        jti: String,
        generatedOn: Number,
    }],
    activationInfo: {
        secret: String,
        secretExpires: Date,
    }
}, {timestamps: true});

module.exports = db.model(ModelNames.USER_MODEL, userSchema);