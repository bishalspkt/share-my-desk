"use strict";

// In memory user model to mock database calls
const _inMemoryUserTable = [];
var _nextId = 100; // random starting value


exports.findUserByEmail = (email, cb) => {
    var found = _inMemoryUserTable.find((user) => {
        return user.email == email;
    });
    cb(null, found ? Object.assign({}, found) : found);
};


exports.createUser = (userObject, cb) => {
    userObject._id = (++_nextId).toString();
    userObject.apiKeys = [];
    userObject.createdAt = new Date();
    userObject.updatedAt = new Date();

    _inMemoryUserTable.push(userObject);
    cb(null, "rawResponse : Success!!");
};


exports.updateUserWithId = (_id, updateObj, cb) => {
    var found = _inMemoryUserTable.find((user) => {
        return user._id == _id;
    });
    
    if (!found) {
        return cb(new Error("User Id not found"));
    }

    Object.assign(found, updateObj);
    cb(null, "update Success");
};

exports._internalState =  _inMemoryUserTable;