"use strict";

const BigNumber = require('bignumber.js');

const inherits = require('util').inherits;
const BaseComponent = require("../BaseComponent");
const { DB, Util, Constant } = require('../utils');
const Config = require("../config/Config");
const WalletManager = require("./WalletManager");
const TxManager = require("./TxManager");
const { ETHBSCSwapABI } = require('../config/contracts');

const ETHPayer = function () {
    this.web3 = Config.ETH_PROVIDER;
    this.MAX_EVENTS = Config.MAX_EVENTS_IN_BATCH || 30;
    this.PROCESS_INTERVAL = Config.EVENT_PAYER_INTERVAL || 5;
    this.swapContract = new this.web3.eth.Contract(
        ETHBSCSwapABI,
        Config.ETH_BRIDGE_CONTRACT_ADDRESS
    );
    this.isProcessing = false;

    this.MAX_GASPRICE = new BigNumber(Util.toWei(this.web3, Config.ETH_SWAP_GASPRICE_LIMIT, 'gwei'));
}

inherits(ETHPayer, BaseComponent);

ETHPayer.prototype.start = function () {
    setInterval(this.startPayer.bind(this), this.PROCESS_INTERVAL * 60 * 1000);
    this.log('Payer is started');
}

ETHPayer.prototype.sendFillTx = async function (events, gasPrice, walletAddress, walletPrivateKey) {
    try {
        this.log(`Processing ${events.length} ETH2BSC events via wallet ${walletAddress}...`);

        const payload = this.swapContract.methods.fillBSC2ETHSwap(
            events.map(item => item._id),
            events.map(item => item.fromAddress),
            events.map(item => item.amount)
        ).encodeABI()

        const nonce = await this.web3.eth.getTransactionCount(walletAddress);
        const gas = Util.getEthGas(events.length);

        let tx = {
            from: walletAddress,
            to: this.swapContract._address,
            value: 0,
            gasPrice: gasPrice.toFixed(),
            nonce,
            gas,
            data: payload
        };

        this.log(`Tx: ${JSON.stringify(tx)}`);

        const signed = await this.web3.eth.accounts.signTransaction(tx, walletPrivateKey);

        for (let processingEvent of events) {
            await DB.setBSCEvent({
                _id: processingEvent._id,
                blockNumber: processingEvent.blockNumber,
                fromAddress: processingEvent.fromAddress,
                amount: processingEvent.amount,
                isProcessed: true,
                receiptHash: signed.transactionHash,
                status: 'PENDING',
            });
        }

        this.web3.eth.sendSignedTransaction(signed.rawTransaction);

        tx = { ...tx, transactionHash: signed.transactionHash, network: Constant.NETWORK.ETH }
        TxManager.add(tx);

        this.log(`Submitted TxHash: ${signed.transactionHash}`);
    } catch (err) {
        this.log("ERROR", err);
    }
}

ETHPayer.prototype.startPayer = async function () {
    try {
        if (this.isProcessing) return;
        this.isProcessing = true

        // check pending events
        const unprocessedEvents = await DB.getUnprocessedEvents(Constant.NETWORK.BSC);
        if (unprocessedEvents.length == 0) {
            this.isProcessing = false;
            return;
        }

        this.log(`Start to process unminted ${unprocessedEvents.length} events`);

        // check available hot wallet

        let wallets = WalletManager.getWallets(Constant.NETWORK.ETH);
        wallets = wallets.filter(wl => !wl.isInUsed);

        if (wallets.length == 0) {
            this.log(`There is no hotwallet available for ${Constant.NETWORK.ETH} network`);
            this.isProcessing = false;
            return;
        }
        const processingEvents = unprocessedEvents.length >= this.MAX_EVENTS
            ? unprocessedEvents.slice(0, this.MAX_EVENTS)
            : unprocessedEvents;

        const currentGasPrice = BigNumber(await this.web3.eth.getGasPrice());
        const gas = Util.getBscGas(processingEvents.length);

        for (let wallet of wallets) {

            const bnbBalance = BigNumber(await this.web3.eth.getBalance(wallet.address));
            const fee = currentGasPrice.times(gas);

            if (currentGasPrice.gt(this.MAX_GASPRICE)) {
                this.log('Current gasprice is too high, wait little more.');
                continue;
            }

            if (fee.gt(bnbBalance)) {
                this.log('Current fee is larger than hotwallet balance, please topup');
                continue;
            }

            this.log("start processing");
            WalletManager.setIsInUsed(wallet.address, Constant.NETWORK.ETH, true);
            this.sendFillTx(processingEvents, currentGasPrice, wallet.address, wallet.privateKey);

            break;
        }

        this.isProcessing = false;
    } catch (err) {
        this.log(err);
        this.isProcessing = false;
    }
};

module.exports = new ETHPayer();