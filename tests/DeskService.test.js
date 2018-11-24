"use strict";

const moment = require("moment");
const errcodes = require("../lib/constants").ErrorCodes();
const deskModel = require("./mocks/mockDeskModel");

const deskService = require("../services/DeskService");
const desk = deskService.DeskService(deskModel);

test("Test date parsing", () => {
    const sampleStrings = [
        "INVALID",
        "00112233",
        "20180101",
        "20191301",
    ];
    expect(deskService.parseDateString(sampleStrings[0])).toBe(null);
    expect(deskService.parseDateString(sampleStrings[1])).toBe(null);
    expect(deskService.parseDateString(sampleStrings[2])).not.toBe(null);
    expect(deskService.parseDateString(sampleStrings[3])).toBe(null);
});

test("Comparing date to today", () => {
    // Constructing some dates
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = now.getMonth() + 1;
    const DD = now.getDate();

    const dateInPastStr = ((YYYY - 1) * 10000 + MM * 100 + DD).toString();
    const dateInFutureStr = ((YYYY + 1) * 10000 + MM * 100 + DD).toString();
    const todayStr = (YYYY * 10000 + MM * 100 + DD).toString();

    const dateInPast = deskService.parseDateString(dateInPastStr);
    const dateInFuture = deskService.parseDateString(dateInFutureStr);
    const today = deskService.parseDateString(todayStr);

    expect(deskService.isDateBeforeToday(dateInPast)).toBe(true);
    expect(deskService.isDateBeforeToday(dateInFuture)).toBe(false);
    expect(deskService.isDateBeforeToday(today)).toBe(false);

});

test("Comparing date to max days in future and valid range", () => {

    // Using moment for date construction as node does not have good date offset tools
    const today = moment().startOf("day");
    const yesterday = today.clone().subtract(1, "day");
    const tomorrow = today.clone().add(1, "day");
    const lastValidDay = today.clone().add(60, "days");
    const invalidDay = today.clone().add(61, "days");


    expect(deskService.isDateWithinAllowedFuture(today)).toBe(true);
    expect(deskService.isDateWithinAllowedFuture(tomorrow)).toBe(true);
    expect(deskService.isDateWithinAllowedFuture(yesterday)).toBe(true);
    expect(deskService.isDateWithinAllowedFuture(lastValidDay)).toBe(true);
    expect(deskService.isDateWithinAllowedFuture(invalidDay)).toBe(false);


    expect(deskService.isDateInValidRange(today)).toBe(true);
    expect(deskService.isDateInValidRange(yesterday)).toBe(false);
    expect(deskService.isDateInValidRange(tomorrow)).toBe(true);
    expect(deskService.isDateInValidRange(lastValidDay)).toBe(true);
    expect(deskService.isDateInValidRange(invalidDay)).toBe(false);
});



test("Share Desk - Invalid Location", (done) => {

    let today = moment().startOf("day").format("YYYYMMDD");
    const deskDetails = {
        deskNumber: "111",
        officeLocation: "INVALID",
        datesAvailable: [today]
    };

    desk.share(deskDetails, "101", (err) => {
        expect(err).toBe(errcodes.INVALID_OFFICE_LOCATION);
        done();
    });
});

test("Share Desk - Invalid Date Format", (done) => {

    const deskDetails = {
        deskNumber: "111",
        officeLocation: "SYD",
        datesAvailable: ["INVALID_DATE"]
    };

    desk.share(deskDetails, "101", (err) => {
        expect(err).toBe(errcodes.INVALID_DATE_FORMAT);
        done();
    });
});

test("Share Desk - Date not in valid range", (done) => {

    let yesterday = moment().startOf("day").subtract(1, "day").format("YYYYMMDD");
    const deskDetails = {
        deskNumber: "111",
        officeLocation: "SYD",
        datesAvailable: [yesterday]
    };

    desk.share(deskDetails, "101", (err) => {
        expect(err).toBe(errcodes.DATE_NOT_IN_VALID_RANGE);
        done();
    });
});

test("Share Desk - Successful", (done) => {

    let today = moment().startOf("day");
    let fiveDaysLater = today.clone().add(5, "days").format("YYYYMMDD");
    let tenDaysLater = today.clone().add(10, "days").format("YYYYMMDD");
    const deskDetails = {
        deskNumber: "111",
        officeLocation: "SYD",
        datesAvailable: [fiveDaysLater, tenDaysLater]
    };

    desk.share(deskDetails, "101", (err, response) => {
        expect(err).toBe(null);
        expect(response).toBeTruthy();
        expect(response.insertCount).toBe(2);
        done();
    });
});

test("Share Desk - Already shared", (done) => {

    let fiveDaysLater = moment().startOf("day").add(5, "days").format("YYYYMMDD");
    const deskDetails = {
        deskNumber: "111",
        officeLocation: "SYD",
        datesAvailable: [fiveDaysLater]
    };

    desk.share(deskDetails, "101", (err) => {
        expect(err).toBe(errcodes.DESK_ALREADY_SHARED);
        done();
    });
});