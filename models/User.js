"use strict";

var db = require("../lib/db");

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
    accountInfo: {
        secret: String,
        secretExpires: Date,
    }
}, {timestamps: true});

module.exports = db.model("User", userSchema);