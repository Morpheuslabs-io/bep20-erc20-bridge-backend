"use strict"

const path = require('path');
const inherits = require('util').inherits;
const BaseComponent = require('../BaseComponent');

const Config = function () {
    let mainPath = path.dirname(require.main.filename);
    let env = process.env.NODE_ENV || "testnet";
    let configFile = `${mainPath}/../config/${env}.js`;

    let config = require(configFile);
    // this.log("ENV CONFIG -", config);

    return config;
}

inherits(Config, BaseComponent);

module.exports = new Config();