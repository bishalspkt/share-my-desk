"use strict";

const utils = require("../lib/utils");
const webUtils = require("../lib/webUtils");
const authService = require("../services/AuthService").authService();

const signUp = (req, res) => {

    const email = req.body.email;
    const name = req.body.name;

    authService.signUp(email, name, (ERRCODE, responseObject) => {
        if (utils.isNotNull(ERRCODE)) {
            webUtils.sendFailure(res, ERRCODE, "Could not complete the sign up process. Please try again later.");
            return;
        }
        webUtils.sendSuccess(res, responseObject);
    });

};

const logIn = (req, res) => {

    const email  = req.body.email;
    const secret = req.body. secret;

    authService.login(email, secret, (ERRCODE, responseObject) => {
        if (utils.isNotNull(ERRCODE)) {
            webUtils.sendFailure(res, ERRCODE, "Login failed. Please try again later.");
            return;
        }
        webUtils.sendSuccess(res, responseObject); 
    });
};

exports.install = (server) => {
    const signUpRequestValidatorMiddleware = webUtils.getBodyValidatorMiddleware(["email", "name"]);
    const loginRequestValidatorMiddleware = webUtils.getBodyValidatorMiddleware(["email", "secret"]);

    server.post(server.getPath("/auth/signup"), signUpRequestValidatorMiddleware, signUp);
    server.post(server.getPath("/auth/login"), loginRequestValidatorMiddleware, logIn);
};