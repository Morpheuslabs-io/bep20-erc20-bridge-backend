"use strict"

const inherits = require('util').inherits;
const BaseComponent = require("../BaseComponent");
const Config = require("../config/Config");
const { DB, Util, Constant } = require('../utils');
const { BSCETHSwapABI } = require('../config/contracts');

const BSCScanner = function () {
    this.web3 = Config.BSC_PROVIDER;
    this.swapAgentContract = new this.web3.eth.Contract(
        BSCETHSwapABI,
        Config.BSC_BRIDGE_CONTRACT_ADDRESS
    );
}

inherits(BSCScanner, BaseComponent);

BSCScanner.prototype.start = function () {
    this.id = setInterval(this.startScanEvents.bind(this), Config.EVENT_SCAN_INTERVAL * 60 * 1000);
    this.log("BSCscanner is started");
    this.startScanEvents();
}

BSCScanner.prototype.startScanEvents = async function () {
    try {
        const currentBlockNumber = await this.web3.eth.getBlockNumber();
        const startBlock = Number(await DB.getConfig('bscStartBlock'));
        const endBlock = currentBlockNumber - Number(Config.BSC_DELAY_BLOCK_COUNT);

        if (startBlock === endBlock) return;

        const queue = Array.from(
            { length: endBlock - startBlock },
            (_, index) => index + startBlock
        )

        await this.processEventBlocks(queue);

        await DB.setConfig('bscStartBlock', endBlock.toString());
    } catch (err) {
        this.log(err);
    }
}

BSCScanner.prototype.processEventBlocks = async function (blocks) {
    try {
        this.log(`Scanning BSC from ${blocks[0]} to ${blocks[blocks.length - 1]}...`);

        const pastEvents = await this.swapAgentContract.getPastEvents('SwapStarted', {
            fromBlock: blocks[0],
            toBlock: blocks[blocks.length - 1],
        });

        if (pastEvents == null || pastEvents.length == 0) {
            return;
        }

        this.log(`Scanned BSC from ${blocks[0]} to ${blocks[blocks.length - 1]}: ${pastEvents.length} event(s)`);

        for (const pastEvent of pastEvents) {
            let event = {
                _id: pastEvent.transactionHash,
                blockNumber: pastEvent.blockNumber,
                fromAddress: pastEvent.returnValues.fromAddr,
                amount: pastEvent.returnValues.amount,
                isProcessed: false,
                receiptHash: '',
                status: 'PENDING',
            }

            // console.log(event);
            await DB.setBSCEvent(event);
        }
    } catch (err) {
        this.log(`Scanning BSC from ${blocks[0]} to ${blocks[blocks.length - 1]}`, err);
    }
}

module.exports = BSCScanner;