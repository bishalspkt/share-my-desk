"use strict";

/**
 * Barebones mock user model
 */
const userModel = () => ({ save: (cb) => cb() });

userModel.findOne = function(searchObject, cb) {
    cb(null, null);
};

module.exports = userModel;