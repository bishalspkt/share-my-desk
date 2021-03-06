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
        UNKNOWN_ERROR: "UNKNOWN_ERROR",
        SECRET_INCORRECT: "SECRET_INCORRECT",
        SECRET_EXPIRED: "SECRET_EXPIRED",
        NO_DESK_FOUND: "NO_DESK_FOUND",
        INVALID_OFFICE_LOCATION: "INVALID_OFFICE_LOCATION",
        INVALID_DATE_FORMAT: "INVALID_DATE_FORMAT",
        DATE_NOT_IN_VALID_RANGE: "DATE_NOT_IN_VALID_RANGE",
        DESK_ALREADY_SHARED: "DESK_ALREADY_SHARED"
    };
};

instance.ModelNames = () => {
    return {
        USER_MODEL: "User",
        DESK_MODEL: "Desk"
    };
};

module.exports = instance;