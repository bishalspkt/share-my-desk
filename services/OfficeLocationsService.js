"use strict";

// Currently using a file backed data service, can be modified to plug in a databse
exports.getOfficeLocations = () =>  require("./datafiles/officeLocations.json");
