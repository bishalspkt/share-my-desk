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
const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;

const webUtils = require("./webUtils");

const config = {
    basePath: "",
    serverURL: utils.getConfig("SERVER_URL", "0.0.0.0"),
    serverPort: utils.getConfig("SERVER_PORT", 8080),
    apiVersion : utils.getConfig("API_VERSION", "1"),
    protectedPaths : /\/api\/v1\/(?![(?auth)|(?apidoc)])/
};

/**
 * Creates a wrapped express js server
 */
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

    appServer.disable("x-powered-by"); // Don't send x-powered-by header

    /**
     * Returns the api path for a give subpath
     */
    appServer.getPath = (path) => config.basePath +  "/api/v" + config.apiVersion + path;

    /**
     * Installs the osprey RAML middleware
     *
     * @param {String} ramlSpecFile path to the API raml file
     * @param {Function} callback (err, appServer)
     */
    appServer.installRAML = (ramlSpecFile, callback) => {
        const url = appServer.getPath("");
        osprey.loadFile(ramlSpecFile)
            .then((middleware) => {
                appServer.use(url, middleware);
                appServer.use((err, req, res, next) => {
                    logger.warn(`404 Response sent for path ${req.path}`);
                    webUtils.send404(res, "The requested URL was not found. Please try again.");
                    next(err);
                });
                logger.info(`osprey middleware installed at path ${url}`);
                callback(null, appServer);
                return;
            }).catch((err) => {
                if (utils.isNotNull(err)) {
                    callback(err, null);
                    return;
                }
            });
    };

    /**
     * Installs the API documentation as described in the ramlSpecFile
     *
     * @param {String} ramlSpecFile path to API raml file
     */
    appServer.installApiDocs = (ramlSpecFile, installPath) => {
        const apiSpecURL = appServer.getPath(installPath);
        appServer.get(apiSpecURL, (req, res) => {
            raml2html.render(ramlSpecFile, raml2html.getConfigForTheme()).then((result) => {
                res.status(200).send(result);
            }, (err) => {
                logger.warn(err);
                res.status(500).send(err.message);
            });
        });
        logger.info("API information is avialble at " + apiSpecURL);
    };

    /**
     * Creates a http server and starts listening for requests
     *
     * @param {Function} callback optional
     */
    appServer.listen = (callback) => {
        http.createServer(appServer).listen(config.serverPort, config.serverURL, () => {
            logger.info(`Server listening on URL:Port - ${config.serverURL}:${config.serverPort}`);
            if (callback) {
                callback(null);
                return;
            }
        });
    };

    /**
     * Configures passport js authentication using jwts
     *
     * @param {Funtion} callback
     */
    appServer.configurePassportAuth = (callback) => {
        appServer.use(passport.initialize());
        passport.use( new JWTStrategy({
            jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: utils.getConfig("JWT_SECRET", utils.CRITICAL_CONFIG)
        }, (jwtPayload, cb) => cb(null, jwtPayload)
        ));
        appServer.all(config.protectedPaths, passport.authenticate("jwt", { session:false }));
        callback(null, appServer);
    };

    appServer.config = config;

    return appServer;

};