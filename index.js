"use strict";

const async = require("async");
const utils = require("./lib/utils");
const logger = require("./lib/logger");
const server = require("./lib/server").create();
const ramlSpecPath = "raml/api.raml";

const AuthWs = require("./web-services/AuthWs");

utils.assertNodeRuntime();

const installRAMLMiddleware = (done) => {
    server.installRAML(ramlSpecPath, (err, server) => done(err, server));
};

const installWebServices = (server, done) => {
    server.installApiDocs(ramlSpecPath);
    AuthWs.install(server);
    done(null, server);
};

const startListening = (server, done) => {
    server.listen(done);
};

async.waterfall([
    installRAMLMiddleware,
    installWebServices,
    startListening
], (err) => {
    if (err) {
        logger.error(err);
        process.exit(1);
    }
});