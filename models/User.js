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
        tokenHash: String,
        generatedOn: Number,
        _id: false }],
    activationInfo: {
        secret: String,
        secretExpires: Date,
    }
}, {timestamps: true});

const _userModel = db.model(ModelNames.USER_MODEL, userSchema);

exports.findUserByEmail = (email, cb) => _userModel.findOne({email: email}).lean().exec(cb);
exports.createUser = (userObject, cb) => (new _userModel(userObject)).save(cb);
exports.updateUserWithId = (id, updateObj, cb) => _userModel.findByIdAndUpdate(id, updateObj, cb);
