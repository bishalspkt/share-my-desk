"use strict";
const orgEmailDomain = require("../lib/utils").getConfig("ORG_EMAIL_DOMAIN", "example.com");

const authService = require("../services/AuthService");

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

test("Test Signup service", (done) => {
    const userModel = require("./mocks/mockUserModel");
    const auth = authService.authService(userModel);

    auth.signUp("sample@" + orgEmailDomain, "Sample Example",  (ERRCODE, result) => {
        expect(ERRCODE).toBeNull();
        expect(result).not.toBeNull();
        expect(result.secret).not.toBeNull();
        done();
    });
});