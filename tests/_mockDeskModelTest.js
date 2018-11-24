"use strict";

const mockDeskModel = require("./mocks/mockDeskModel");

const desk = {
    deskNumber: "1",
    officeLocation: "SYD",
    notes: "Lorem Ipsum",
    directions: "Somewhere"
};

const dates = [20190101,20190102];

test("insert Desk", (done) => {

    mockDeskModel.insertDesk(desk, dates, (err) => {
        expect(err).toBeFalsy();
        done();
    });
});

test("is Desk Already Shared", (done) => {

    mockDeskModel.isDeskAlreadyShared(desk.deskNumber, desk.officeLocation, [dates[0]], (err, dbDesk) => {
        expect(err).toBeFalsy();
        expect(dbDesk.notes).toBe("Lorem Ipsum");
        expect(dbDesk.directions).toBe("Somewhere");
        done();
    });
});

test("find desks", (done) => {

    const query = {
        officeLocation: "SYD",
        date: 20190101
    };
    mockDeskModel.findDesks(query, (err, dbDesks) => {
        expect(err).toBeFalsy();
        expect(dbDesks.length).toBe(1);
        done();
    });
});