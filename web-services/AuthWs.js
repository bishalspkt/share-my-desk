"use strict";

const utils = require("../lib/utils");
const httpResponseTemplates = require("../lib/httpResponseTemplates");
const authService = require("../services/authService").authService();

const signUp = (req, res) => {
    if (utils.propertyIsNull(req, "body")) {
        httpResponseTemplates.sendFailure(res, "INVALID_REQUEST", "The request did not have required parameters");
    }
    const email = req.body.email;
    const name = req.body.name;

    authService.signUp(email, name, (ERRCODE, responseObject) => {
        if (utils.isNotNull(ERRCODE)) {
            httpResponseTemplates.sendFailure(res, ERRCODE, "Could not complete the sign up process. Please try again later.");
            return;
        }
        httpResponseTemplates.sendSuccess(res, responseObject);
    });

};

const logIn = (req, res) => {
    if (utils.propertyIsNull(req, "body")) {
        httpResponseTemplates.sendFailure(res, "INVALID_REQUEST", "The request did not have required parameters");
    }
    const email  = req.body.email;
    const secret = req.body. secret;

    authService.login(email, secret, (ERRCODE, responseObject) => {
        if (utils.isNotNull(ERRCODE)) {
            httpResponseTemplates.sendFailure(res, ERRCODE, "Login failed. Please try again later.");
            return;
        }
        httpResponseTemplates.sendSuccess(res, responseObject); 
    });
};

exports.install = (server) => {
    server.post(server.getPath("/auth/signup"), signUp);
    server.post(server.getPath("/auth/login"), logIn);
};