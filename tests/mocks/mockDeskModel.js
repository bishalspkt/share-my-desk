"use strict";

// In memory desk model to mock database calls
const _inMemoryDeskTable = [];
var _nextId = 500;


exports.insertDesk = (desk, dates, cb) => {
    // Unpack the desk
    var insertObjects = dates.map(date => Object.assign({date: date}, desk));
    for (var i = 0; i < insertObjects.length; i++) {
        insertObjects[i].id = ++_nextId; // Assign an id
        insertObjects[i].createdAt = new Date();
        insertObjects[i].updatedAt = new Date();

        _inMemoryDeskTable.push(insertObjects[i]);
    }
    cb(null);
};

exports.isDeskAlreadyShared = (deskNumber, officeLocation, proposedDates, cb) => {
    const matchedDesk = _inMemoryDeskTable.find(desk => {
        let deskNumberMatch = desk.deskNumber == deskNumber;
        let officeLocationMatch = desk.officeLocation = officeLocation;
        let proposedDatesMatch = proposedDates.indexOf(desk.date) >= 0;

        return (deskNumberMatch && officeLocationMatch && proposedDatesMatch);
    });
    return cb(null, matchedDesk ? Object.assign({}, matchedDesk) : matchedDesk);

};

exports.findDesks = (query, cb) => {

    const _matchedDesks = _inMemoryDeskTable.filter(desk => {
        // Enter all match criteria here
        const officeLocationMatch = query.officeLocation == desk.officeLocation;
        const dateMatch = query.date == desk.date;

        return (officeLocationMatch && dateMatch);
    });

    const desks = _matchedDesks.map(_desk => {
        return {
            directions: _desk.directions,
            notes: _desk.notes,
            closestRoomName: _desk.closestRoomName,
            isAvailable: _desk.bookedBy ? false : true,
            deskId: _desk._id,
            date: _desk.date,
            officeLocation: _desk.officeLocation,
            deskNumber: _desk.deskNumber,
            postedBy: {
                // This needs linking to another in memory table. Using constant at the moment
                name: "Jason Drew",
                email: "json.drew@example.com"
            },
            postedOn: _desk.updatedAt

        };
    });

    return cb(null, desks);

};

exports._internalState = _inMemoryDeskTable;