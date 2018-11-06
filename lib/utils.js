"use strict";

const assert = require("assert");
const semver = require("semver");

const instance = {};

// Flag a config as critical, if the config is not found, crash
instance.CRITICAL_CONFIG = "CRITICAL_CONFIG";

/**
 * Checks different permutations for null like values
 *
 * @param {Any} value Any value to test
 * @return {Boolean} true if null
 */
instance.isNull = (value) => {
    if (!value || value === null || value === undefined) {
        return true;
    }
    return false;
};

/**
 * Checks if the object has a non null property
 *
 * @param {Object} objectName
 * @param {String} propertyName
 * @return {Boolean} true is non-null property does not exist
 */
instance.propertyIsNull = (objectName, propertyName) => {
    if (instance.isNull(objectName) || instance.isNull(objectName[propertyName])) {
        return true;
    }

    return false;
};

/**
 * Returns the complement of instance.isNull
 */
instance.isNotNull = (value) => !instance.isNull(value);

/**
 * Checks if the value if null-like or empty
 * @param {Any} value value to test
 * @return {Boolean} true if empty
 */
instance.isEmpty = (value) => {
    if (instance.isNull(value)) {
        return true;
    }

    if (value === "" || value === false || value === 0) {
        return true;
    }

    if(Array.isArray(value) && value.length === 0) {
        return true;
    }

    return false;
};

/**
 * Returns value from npm configuration environment
 * @param
 */
instance.getConfig = (propertyName, defaultValue) => {

    const value = process.env["npm_package_config_" + propertyName];

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    if (instance.isEmpty(value)) {
        if (defaultValue === instance.CRITICAL_CONFIG) {
            throw new Error(`Critical config not found. The config ${propertyName} is required. Please set this config and run the server again`);
        }
        return defaultValue;
    }
    return value;
};

instance.isProductionMode = () => process.env["NODE_ENV"] === "PRODUCTION";

instance.assertNodeRuntime = (nodeVersion) => {
    if (instance.isNull(nodeVersion)) {
        var packageJson = require(process.cwd() + "/package.json");

        if (instance.isNull(packageJson.engines) || instance.isNull(packageJson.engines.node)) {
            assert(false, "No node engine defined in package.json");
        }
        nodeVersion = packageJson.engines.node;
    }
    const versionCheckSuccess = semver.satisfies(process.versions.node, nodeVersion);

    assert(versionCheckSuccess, `Node version mismatch. Current environment ${process.versions.node}. Supported version ${nodeVersion}^`);
};

module.exports = instance;