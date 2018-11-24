"use strict";
const orgEmailDomain = require("../lib/utils").getConfig("ORG_EMAIL_DOMAIN", "example.com");

const errcodes = require("../lib/constants").ErrorCodes();
const authService = require("../services/AuthService");
const userModel = require("./mocks/mockUserModel");
const auth = authService.authService(userModel);

var signupSecret = "";
test("isEmailValid", () => {
    expect(authService.isEmailValid("sample@" + orgEmailDomain)).toBe(true);
    expect(authService.isEmailValid("smaple@notexample.com")).toBe(false);
    expect(authService.isEmailValid("notEmail@.dom")).toBe(false);
    expect(authService.isEmailValid("notEmaildom")).toBe(false);
});

test("generateSecret", (done) => {
    authService.generateSecret((result) => {
        expect(result.secret).not.toBe(null);
        expect(result.secret.length).toBe(6);
        expect(result.bcrypt).not.toBe(null);
        done();
    });
});

test("Sign Up - Invalid email", (done) => {
    const invalidEmail = "unknown@someRandomEmail";
    const name = "";
    auth.signUp(invalidEmail, name, (ERRCODE) => {
        expect(ERRCODE).toBe(errcodes.INVALID_EMAIL);
        done();
    });
});

test("Sign Up - Successful", (done) => {
    const email = "sample@" + orgEmailDomain;
    const name = "Sample Example";
    auth.signUp(email, name,  (ERRCODE, result) => {
        expect(ERRCODE).toBeNull();
        expect(result).not.toBeNull();
        expect(result.secret).not.toBeNull();
        signupSecret = result.secret;
        done();
    });
});

test("Login - Invalid Email", (done) => {
    const invalidEmail = "unknown@";
    const secret = "!@#";
    auth.login(invalidEmail, secret, (ERRCODE) => {
        expect(ERRCODE).toBe(errcodes.INVALID_EMAIL);
        done();
    });
});

test("Login - Not recognized email", (done) => {
    const unrecognizedEmail = "unknown@" + orgEmailDomain;
    const secret = "!@#";
    auth.login(unrecognizedEmail, secret, (ERRCODE) => {
        expect(ERRCODE).toBe(errcodes.EMAIL_UNKNOWN);
        done();
    });
});

test("Login - Incorrect secret", (done) => {
    const unrecognizedEmail = "sample@" + orgEmailDomain;
    const secret = "!@#";
    auth.login(unrecognizedEmail, secret, (ERRCODE) => {
        expect(ERRCODE).toBe(errcodes.SECRET_INCORRECT);
        done();
    });
});

test("Login - Successful", (done) => {
    const email = "sample@" + orgEmailDomain;
    auth.login(email, signupSecret, (ERRCODE, response) => {
        expect(ERRCODE).toBeFalsy();
        expect(response.apiToken).toBeTruthy();
        done();
    });
});