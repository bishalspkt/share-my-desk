"use strict";

const async = require("async");
const utils = require("./lib/utils");
const logger = require("./lib/logger");
const server = require("./lib/server").create();
const ramlSpecPath = "raml/api.raml";

utils.assertNodeRuntime();

const installRAMLMiddleware = (done) => {
    server.installRAML(ramlSpecPath, (err, server) => done(err, server));
};

const startListening = (server, done) => {
    server.listen(done);
};

const installApiDocWs = (server, done) => {
    server.installApiDocWs(ramlSpecPath);
    done(null, server);
};

const installWebServices = (server, done) => {
    // None built so far
    done(null, server);
};

async.waterfall([
    installRAMLMiddleware,
    installApiDocWs,
    installWebServices,
    startListening
], (err) => {
    if (err) {
        logger.error(err);
        process.exit(1);
    }
});