"use strict";

const instance = {};

/**
 * Error codes available to web services
 */
instance.ErrorCodes = () => {
    return {
    DATABASE_ERROR: "DATABASE_ERROR",
    INVALID_EMAIL: "INVALID_EMAIL",
    EMAIL_UNKNOWN: "EMAIL_UNKNOWN",
    UNKNOWN_ERROR: "SECRET_INCORRECT",
    SECRET_EXPIRED: "SECRET_EXPIRED",
    }
}

module.exports = instance