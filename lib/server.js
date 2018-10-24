"use strict";

const express = require("express");
const cors = require("cors");
const http = require("http");
// const path = require("path");
const bodyParser = require("body-parser");
const osprey = require("osprey");
const raml2html = require("raml2html");

const logger = require("./logger");
const utils = require("./utils");
// const httpResponseTemplates = require('./httpResponseTemplates');

const config = {
    serverURL: utils.getConfig("SERVER_URL", ""),
    serverPort: utils.getConfig("SERVER_PORT", 8080),
    apiVersion : utils.getConfig("API_VERSION", "1"),
};
exports.create = () => {

    let appServer = express();

    appServer.use(cors());
    appServer.use((req, res, next) => {
        logger.info("GET " + req.path);
        next();
    });
    appServer.use(bodyParser.urlencoded({
        limit: "5mb",
        extended: false
    }));

    appServer.use(bodyParser.json({
        limit: "5mb"
    }));

    appServer.getFullURL = (path) => config.serverURL +  "/api/v" + config.apiVersion + path;

    appServer.installRAML = (ramlSpecFile, callback) => {
        const url = appServer.getFullURL("/");
        osprey.loadFile(ramlSpecFile)
            .then((middleware) => {
                appServer.use(url, middleware);
                logger.info(`osprey middleware installed at path ${url}`);
                callback(null, appServer);
                return;
            }).catch((err) => {
                if(utils.isNotNull(err)) {
                    callback(err, null);
                    return;
                }
            });
    };

    appServer.installApiDocWs = (ramlSpecFile) => {
        const apiSpecURL = appServer.getFullURL("/specs");
        appServer.get(apiSpecURL, (req, res) => {
            raml2html.render(ramlSpecFile, raml2html.getConfigForTheme()).then((result) => {
                res.status(200).send(result);
            }, (err) => {
                logger.warn(err);
                res.status(500).send(err.message);
            });
        });
        logger.info("API Documents avialble at " + apiSpecURL);
    };

    appServer.listen = (callback) => {
        http.createServer(appServer).listen(config.serverPort, config.serverURL, () => {
            logger.info("Server listening");
            if(callback) {
                callback(null);
                return;
            }
        });
    };

    appServer.config = config;

    return appServer;

};