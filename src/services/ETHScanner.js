"use strict";

const inherits = require('util').inherits;
const BaseComponent = require("../BaseComponent");
const Config = require("../config/Config");
const { DB, Util, Constant } = require('../utils');
const { ETHBSCSwapABI } = require("../config/contracts");

const ETHScanner = function () {
    this.web3 = Config.ETH_PROVIDER;
    this.swapAgentContract = new this.web3.eth.Contract(
        ETHBSCSwapABI,
        Config.ETH_BRIDGE_CONTRACT_ADDRESS
    );
}

inherits(ETHScanner, BaseComponent);

ETHScanner.prototype.start = function () {
    this.log("Ethscanner is started");
    this.startScanEvents();
    this.id = setInterval(this.startScanEvents.bind(this), Config.EVENT_SCAN_INTERVAL * 60 * 1000);
}

ETHScanner.prototype.startScanEvents = async function () {
    try {
        const currentBlockNumber = await this.web3.eth.getBlockNumber();
        const startBlock = Number(await DB.getConfig('ethStartBlock'));
        const endBlock = currentBlockNumber - Number(Config.ETH_DELAY_BLOCK_COUNT);

        if (startBlock === endBlock) return;

        const queue = Array.from(
            { length: endBlock - startBlock },
            (_, index) => index + startBlock
        );

        await this.processEthEvents(this.web3.eth, queue);

        await DB.setConfig('ethStartBlock', endBlock.toString());
    } catch (err) {
        this.log(err);
    }
}

ETHScanner.prototype.processEthEvents = async function (eth, blocks) {
    try {
        this.log(`Scanning ETH from ${blocks[0]} to ${blocks[blocks.length - 1]}...`);

        const pastEvents = await this.swapAgentContract.getPastEvents('SwapStarted', {
            fromBlock: blocks[0],
            toBlock: blocks[blocks.length - 1],
        });

        if (pastEvents == null || pastEvents.length == 0) {
            return;
        }

        this.log(`Scanned ETH from ${blocks[0]} to ${blocks[blocks.length - 1]}: ${pastEvents.length} event(s)`);

        for (const pastEvent of pastEvents) {
            await DB.setEthEvent({
                _id: pastEvent.transactionHash,
                blockNumber: pastEvent.blockNumber,
                fromAddress: pastEvent.returnValues.fromAddr,
                amount: pastEvent.returnValues.amount,
                isProcessed: false,
                receiptHash: '',
                status: 'PENDING',
            });
        }
    } catch (err) {
        this.log(`Scanning ETH from ${blocks[0]} to ${blocks[blocks.length - 1]}`, err);
    }
}

module.exports = ETHScanner;