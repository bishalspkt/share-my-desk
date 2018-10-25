"use strict";

const userModel = require("../models/User");
const utils = require("../lib/utils");
const logger = require("../lib/logger");
const validator = require("email-validator");

const orgDomain = utils.getConfig("ORG_EMAIL_DOMAIN", "example.com");
/**
 * Check if the email is valid
 * @param {String} email
 * @return {Boolean}
 */
const isEmailValid = (email) => {
    // Simple email test
    if (!validator.validate(email)) {
        return false;
    }
    // Check organization domain only
    return email.split("@",2)[1] === orgDomain;
};

const generateSecret = () => {
    return {
        "code": "123456",
        "bcrypt": "343434"
    };
};

exports.signUp = (email, name, cb) => {
    if (!isEmailValid(email)) {
        return cb("INVALID_EMAIL");
    }
    // test if email exists
    userModel.findOne({ email: email }, (err, user) => {
        if (err) {
            return cb("DATABASE_ERROR");
        }
        if (user) {
            // User found
            return cb("DUPLICATE_EMAIL");
        }
        // Generate secret
        const secret = generateSecret();
        const newUser = new userModel({email: email, name: name});
        newUser.save((err) => {
            if (err) {
                return cb(err);
            }
            cb(null);
        });
    });
};

