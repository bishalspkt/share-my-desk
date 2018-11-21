"use strict";

const moment = require("moment");
const deskService = require("../services/DeskService");

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