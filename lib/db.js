"use strict";

const mongoose = require("mongoose");
const logger = require("./logger");
const utils = require("./utils");

const host = utils.getConfig("MONGO_HOST", "127.0.0.1");
const port = utils.getConfig("MONGO_PORT", "27017");
const username =  utils.getConfig("MONGO_USERNAME", null);
const password = utils.getConfig("MONGO_PASSWORD", null);
const databaseName = utils.getConfig("MONGO_DB_NAME", "share_my_desk");
const authDb = utils.getConfig("AUTH_DB", "admin");
const connectionString = `mongodb://${host}:${port}`;

const connectionOptions = {
    authSource: authDb,
    dbName: databaseName,
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true
};

if (utils.isNotNull(username)) {
    connectionOptions.user = username;
}
if (utils.isNotNull(password)) {
    connectionOptions.password = password;
}

if (!global.mongoose) {
    mongoose.connect(connectionString, connectionOptions).then(
        () => logger.info(`Connected to mongo on ${connectionString}`) ,
        (err) => {
            logger.error(err);
            process.exit(1);
        }
    );
    global.mongoose = mongoose;
}

module.exports = global.mongoose;