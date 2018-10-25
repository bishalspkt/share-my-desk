"use strict";

const utils = require("./utils");
const instance = {};

/**
 * Send a HTTP response with 404 status code
 * 
 * @param {Object} expressResponseObject res object from express js
 * @param {String} message optional message to include
 */
instance.send404 = (expressResponseObject, message) => {
    if (utils.isEmpty(message)) {
        message = "The requested resource could not be found";
    }

    const payload = {
        success: false,
        message: message,
        ERRCODE: "404"
    };
    expressResponseObject.status(404).send(payload);
};

/**
 * Send a HTTP response with 200 status code
 * 
 * @param {Object} expressResponseObject res object from express js
 * @param {Object} payload object to include in the response body
 */
instance.sendSuccess = (expressResponseObject, payload) => {
    if (utils.propertyIsNull(payload, "message")) {
        payload.message = "Your request was completed successfully.";
    }

    expressResponseObject.status(200).send(payload);
};
/**
 * Send a HTTP response with 500 status code
 * 
 * @param {Object} expressResponseObject res object from express js
 * @param {String} ERRCODE error code to include in reponse body
 * @param {String} message optional message to include
 */
instance.sendFailure = (expressResponseObject, ERRCODE, message) => {
    if (utils.isNull(message)) {
        message = "Sorry, your request could not be completed";
    }
    const responseObject = {
        success: false,
        ERRCODE: ERRCODE,
        message:message
    };

    expressResponseObject.status(500).send(responseObject);
};

module.exports = instance;