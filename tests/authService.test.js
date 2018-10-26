"use strict";
const authService = require("../services/authService");

test("isEmailValid", () => {
    expect(authService.isEmailValid("sample@example.com")).toBe(true);
    expect(authService.isEmailValid("smaple@notexample.com")).toBe(false);
    expect(authService.isEmailValid("notEmail@.dom")).toBe(false);
});

test("generateSecret", (done) => {
    authService.generateSecret((result) => {
        expect(result.secret).not.toBe(null);
        expect(result.secret.length).toBe(6);
        expect(result.bcrypt).not.toBe(null);
        done();
    });
});