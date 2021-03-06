"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("email-validator");
const { Entropy } = require("entropy-string");
const jwt = require("jsonwebtoken");
const logger = require("../lib/logger");
const utils = require("../lib/utils");
const errcodes = require("../lib/constants").ErrorCodes();

const entropy = new Entropy({charset: "1234567890ABCDEF"});
const orgDomain = utils.getConfig("ORG_EMAIL_DOMAIN", "example.com");
const bcryptCost = utils.getConfig("BCRYPT_COST", 11);
const jwtSecret = utils.getConfig("JWT_SECRET", utils.CRITICAL_CONFIG);

const SECRET_EXPIRES_IN = 2 * 3600 * 1000; // 2 hours
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

const generateSecret = (cb) => {
    const secret = entropy.string().substring(0,6); // Get 6 char secret with high entropy
    bcrypt.hash(secret, bcryptCost, function(err, hash) {
        cb({ secret: secret, bcrypt: hash });
    });

};

const getJWTForUser = (user) => {
    const payload = {
        iat: new Date() / 1000,
        iss: "authService.login",
        sub: user._id,
        name: user.name
    };
    payload.jti = crypto.createHash("md5").update(payload.sub + payload.iat).digest("hex");

    return {
        jwt: jwt.sign(payload, jwtSecret),
        payload: payload
    };
};
/**
 * Creates an authService instance
 * @param {User} userModel db model to inject for database connectivity
 */
exports.authService = (userModel) => {

    // If no model was injected, use default
    if (!userModel) {
        userModel = require("../models/User");
    }
    const instance = {};

    /**
     * Sign up for the API
     * Generates a secret key used to activate the user
     *
     * @param {String} email
     * @param {String} name
     * @param {Function} cb (err, response)
     */
    instance.signUp = (email, name, cb) => {
        if (!isEmailValid(email)) {
            return cb(errcodes.INVALID_EMAIL);
        }
        // test if email exists
        userModel.findUserByEmail(email, (err, matchedUser) => {
            if (err) {
                logger.error(err);
                return cb(errcodes.DATABASE_ERROR);
            }

            // Generate secret
            generateSecret((value) => {

                const activationInfo = {
                    secret: value.bcrypt,
                    secretExpires: new Date(Date.now() + SECRET_EXPIRES_IN).toISOString()
                };
                if (utils.isNull(matchedUser)) {
                    // New user sign up
                    const newUser = {
                        email: email,
                        name: name,
                        activationInfo: activationInfo
                    };
                    userModel.createUser(newUser, (err) => {
                        if (err) {
                            logger.error(err);
                            return cb(errcodes.DATABASE_ERROR);
                        }
                        return cb(null, {secret: value.secret});
                    });
                } else {
                    // Existing user signing up for new token
                    const updateObject = {
                        activationInfo: activationInfo
                    };
                    userModel.updateUserWithId(matchedUser._id, updateObject, (err, rawResponse) => {
                        if (err) {
                            logger.error(err);
                            return cb(errcodes.DATABASE_ERROR, rawResponse);
                        }
                        return cb(null, {secret: value.secret});
                    });
                }
            });
        });
    };

    /**
     * Login with the given credentials.
     * Generates API token after verification
     *
     * @param {String} email
     * @param {String} secret
     * @param {Function} cb(error, response)
     */
    instance.login = (email, secret, cb) => {
        if (!isEmailValid(email)) {
            logger.warn(`Invalid email login attempt denied. Email: ${email}`);
            return cb(errcodes.INVALID_EMAIL);
        }
        userModel.findUserByEmail(email, (err, matchedUser) => {
            if (err) {
                logger.error(err);
                return cb(errcodes.DATABASE_ERROR);
            }
            if (utils.isNull(matchedUser)) {
                logger.warn(`Unknown email login attempt denied. Email: ${email}`);
                return cb(errcodes.EMAIL_UNKNOWN);
            }
            // Email match was found, check the secret
            if (utils.propertyIsNull(matchedUser, "activationInfo")) {
                logger.warn(`Unknown error attempt denied. Email: ${email}`);
                return cb(errcodes.UNKNOWN_ERROR); // mandatory field not found
            }

            bcrypt.compare(secret, matchedUser.activationInfo.secret, (err, matched) => {
                if (err || matched == false) {
                    logger.warn(`Login attempt denied. Incorrect secret. Email: ${email}`);
                    return cb(errcodes.SECRET_INCORRECT);
                }

                const secretExpires = matchedUser.activationInfo.secretExpires;
                if (utils.isNull(secretExpires) || Date.now() > secretExpires) {
                    logger.warn(`Login attempt denied. Secret expired. Email: ${email}`);
                    return cb(errcodes.SECRET_EXPIRED);
                }
                // Generate API token
                const token = getJWTForUser(matchedUser);
                matchedUser.apiKeys.push({ tokenHash: token.payload.jti, generatedOn: token.payload.iat });

                // Invalidate the login and save api key
                const updateObject = {
                    activationInfo: null,
                    apiKeys: matchedUser.apiKeys
                };
                userModel.updateUserWithId(matchedUser._id, updateObject, (err, rawResponse) => {
                    if (err) {
                        logger.error(err);
                        return cb(errcodes.DATABASE_ERROR);
                    }
                    logger.info(`Successful login. Email: ${email}`, rawResponse);
                    return cb(null, {apiToken: token.jwt});
                });
            });
        });
    };

    return instance;
};

// Exporting for testability
exports.isEmailValid = isEmailValid;
exports.generateSecret = generateSecret;