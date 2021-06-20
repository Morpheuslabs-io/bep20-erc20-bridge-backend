"use strict"

const { DB, Util, Constant } = require('./utils');
const ETHScanner = require("./services/ETHScanner");
const BSCScanner = require("./services/BSCScanner");


async function main() {
    await DB.init();
    let ethScanner = new ETHScanner();
    ethScanner.start();

    let bscScanner = new BSCScanner();
    bscScanner.start();
}

main();