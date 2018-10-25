"use strict";

const logger = require("../lib/logger");
const utils = require("../lib/utils");
const httpResponseTemplates = require("../lib/httpResponseTemplates");
const signUpService = require("../services/SignUpService");

const signUp = (req, res) => {
    if (utils.propertyIsNull(req, "body")) {
        httpResponseTemplates.sendFailure(res, "INVALID_REQUEST", "The request did not have required parameters");
    }
    const email = req.body.email;
    const name = req.body.name;

    signUpService.signUp(email, name, (err) => {
        if(utils.isNotNull(err)) {
            httpResponseTemplates.sendFailure(res, "SIGN_UP_FAILED", "Could not complete the sign up process. Please try again later.");
            return;
        }
        httpResponseTemplates.sendSuccess(res, {});
    });

};

const logIn = (req, res) => {
    httpResponseTemplates.sendSuccess(res, {});
};

exports.install = (server) => {
    server.post(server.getPath("/auth/signup"), signUp);
    server.post(server.getPath("/auth/login"), logIn);
};