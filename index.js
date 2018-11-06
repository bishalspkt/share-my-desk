"use strict";

const async = require("async");
const utils = require("./lib/utils");
const logger = require("./lib/logger");
const server = require("./lib/server").create();
const ramlSpecPath = "raml/api.raml";

const AuthWs = require("./routes/AuthWs");
const DeskWs = require("./routes/DeskWs");
const OfficeLocationsWs = require("./routes/OfficeLocationsWs");

utils.assertNodeRuntime();

const configureAuth = (done) => {
    server.configurePassportAuth(done);
};

const installRAMLMiddleware = (server, done) => {
    server.installRAML(ramlSpecPath, (err, server) => done(err, server));
};

const installWebServices = (server, done) => {
    server.installApiDocs(ramlSpecPath, "/apidoc");
    AuthWs.install(server);
    DeskWs.install(server);
    OfficeLocationsWs.install(server);
    done(null, server);
};

const startListening = (server, done) => {
    server.listen(done);
};

async.waterfall([
    configureAuth,
    installRAMLMiddleware,
    installWebServices,
    startListening
], (err) => {
    if (err) {
        logger.error(err);
        process.exit(1);
    }
});