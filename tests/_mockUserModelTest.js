"use strict";

const mockUserModel = require("./mocks/mockUserModel");

test("FindUserByEmail", (done) => {
    mockUserModel.findUserByEmail("sample@example.com", (err, user) => {
        expect(err).toBeFalsy();
        expect(user).toBeFalsy();
        done();
    });
});

test("Create User", (done) => {
    const user = {
        name: "John Doe",
        email: "john.doe@example.com",
        activated: false
    };
    mockUserModel.createUser(user, (err) => {
        expect(err).toBe(null);

        // Try finding it now
        mockUserModel.findUserByEmail(user.email, (err2, dbUser) => {
            expect(err2).toBe(null);
            expect(dbUser.name).toBe(user.name);
            done();
        });
    });
});

test("Update User", (done) => {
    mockUserModel.updateUserWithId(101, {name: "Jane Doe", activated: true}, (err) => {

        expect(err).toBeFalsy();
        // Check update was success
        mockUserModel.findUserByEmail("john.doe@example.com", (err, dbUser) => {
            expect(err).toBeFalsy();
            expect(dbUser.name).toBe("Jane Doe");
            expect(dbUser.activated).toBe(true);
            done();
        });
    });
});