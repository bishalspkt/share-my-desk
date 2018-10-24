"use strict";

const utils = require("./utils");
const instance = {};

instance.send404 = (res, message) => {
    if (utils.isEmpty(message)) {
        message = "The requested resource could not be found";
    }

    const responseObject = {
        success: false,
        message: message,
        ERRCODE: 404
    };
    res.status(404).send(responseObject);
};

module.exports = instance;