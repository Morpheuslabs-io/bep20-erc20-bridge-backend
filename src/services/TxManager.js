"use strict";

const BigNumber = require('bignumber.js');

const inherits = require('util').inherits;
const BaseComponent = require("../BaseComponent");
const { DB, Util, Constant } = require('../utils');
const Config = require("../config/Config");
const WalletManager = require("./WalletManager");

const TxManager = function () {
    this._txs = new Map();
    this.isProcessing = false;
    this.ethWeb3 = Config.ETH_PROVIDER;
    this.bscWeb3 = Config.BSC_PROVIDER;

    setInterval(this.checkTxStatus.bind(this), 1 * 60 * 1000);
}

inherits(TxManager, BaseComponent);

TxManager.prototype.add = function (tx) {
    this.log("Added tx to monitor", tx);
    this._txs.set(tx.transactionHash.toLowerCase(), tx);
}

TxManager.prototype.delete = function (txHash) {
    this._txs.delete(txHash.toLowerCase());
}

TxManager.prototype.get = function (txHash) {
    return this._txs.get(txHash.toLowerCase());
}

TxManager.prototype.checkTxStatus = async function () {
    if (this.isProcessing) return;

    this.isProcessing = true;
    let txs = [... this._txs.values()];
    if (txs.length > 0) this.log(`Checking status of ${txs.length} txs`)

    txs.forEach(async tx => {
        try {
            const receipt = tx.network == Constant.NETWORK.ETH
                ? await this.ethWeb3.eth.getTransactionReceipt(tx.transactionHash)
                : await this.bscWeb3.eth.getTransactionReceipt(tx.transactionHash);

            this.log(`Transaction receipt for ${tx.transactionHash}`, receipt);

            if (receipt) {
                let model = tx.network == Constant.NETWORK.ETH ? Constant.NETWORK.BSC : Constant.NETWORK.ETH;
                const events = await DB.getEventByReceiptHash(model, tx.transactionHash);

                for (let event of events) {
                    let updatedEvent = {
                        _id: event._id,
                        blockNumber: event.blockNumber,
                        fromAddress: event.fromAddress,
                        amount: event.amount,
                        isProcessed: true,
                        receiptHash: receipt.transactionHash,
                        status: receipt.status ? 'COMPLETED' : 'FAILED',
                    };

                    if (tx.network == Constant.NETWORK.BSC) {
                        await DB.setEthEvent(updatedEvent);
                    } else if (tx.network == Constant.NETWORK.ETH) {
                        await DB.setBSCEvent(updatedEvent);
                    }
                }

                WalletManager.setIsInUsed(
                    tx.from,
                    tx.network,
                    false
                );
                this.delete(tx.transactionHash);
            }
        } catch (err) {
            this.log(err);
        }
    });

    this.isProcessing = false;
}

module.exports = new TxManager();