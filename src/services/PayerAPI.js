"use strict";

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const BigNumber = require('bignumber.js');

const inherits = require('util').inherits;
const BaseComponent = require("../BaseComponent");
const Config = require('../config/Config');
const WalletManager = require('./WalletManager');
const { DB, Constant, Util } = require('../utils');
const { ERC20ABI } = require('../config/contracts');
const BSCPayer = require('./BSCPayer');
const ETHPayer = require('./ETHPayer');
const TxManager = require('./TxManager');

const PayerAPI = function (app) {
    this.PORT = process.env.PORT || 3002;
    this.app = app;
    this.http = require('http').Server(this.app);

    this.web3 = Config.ETH_PROVIDER;
    this.erc20TokenContract = new this.web3.eth.Contract(ERC20ABI, Config.ETH_TOKEN_ADDRESS);
    this.TOKEN_ALLOWANCE_THRESHOLD = BigNumber(Util.toWei(this.web3, Config.ETH_TOKEN_ALLOWANCE_THRESHOLD, 'ether'));
    this.MAX_GAS_PRICE = BigNumber(Util.toWei(this.web3, Config.ETH_SWAP_GASPRICE_LIMIT, 'gwei'));
}

inherits(PayerAPI, BaseComponent);

PayerAPI.prototype.start = async function () {
    this.createRoutes();
    await DB.init();

    BSCPayer.start();
    ETHPayer.start();

    this.http.listen(this.PORT, () => this.log(`App listening on port ${this.PORT}!`));
    this.log("PayerAPI is started");
}

PayerAPI.prototype.approveSpender = async function (amount, gasPrice, walletPrivateKey) {
    try {
        this.log(`Approving wallet ${walletAddress}: ${amount.toFixed()}...`);

        const method = glitchContract.methods.approve(
            Config.ETH_BRIDGE_CONTRACT_ADDRESS,
            amount.toFixed()
        );

        const nonce = await this.web3.eth.getTransactionCount(walletAddress);

        const tx = {
            from: walletAddress,
            to: Config.ETH_TOKEN_ADDRESS,
            value: 0,
            nonce: nonce,
            gas: 50000,
            gasPrice: gasPrice,
            data: method.encodeABI(),
        };

        this.log(`Tx: ${JSON.stringify(tx)}`);

        const signed = await web3.eth.accounts.signTransaction(tx, walletPrivateKey);

        web3.eth.sendSignedTransaction(signed.rawTransaction);

        WalletManager.setIsInUsed(address, Constant.NETWORK.ETH, true);
        TxManager.add({ ...tx, netowrk: Config.NETWORK.ETH });

        this.log(`TxHash: ${signed.transactionHash}`);
    } catch (err) {
        this.log("There are ERROR in approve sender", err);
    }
}

PayerAPI.prototype.createRoutes = function () {
    this.app.get('/wallets', (req, res) => this.getWallets(req, res));

    this.app.post('/wallet', (req, res) => this.addWallet(req, res));
    this.app.delete('/wallet', (req, res) => this.controller.removeWallet(req, res));
}

PayerAPI.prototype.addWallet = async function (req, res) {

    try {
        let { address, privateKey, network } = req.body;
        if (!this.web3.utils.isAddress(address)) throw Error('Invalid address');

        let result = WalletManager.addWallet(address, privateKey, network);

        if (result && network === Constant.NETWORK.ETH) {
            const currentGasPrice = BigNumber(await this.web3.eth.getGasPrice());
            const fee = currentGasPrice.times(50000);
            const ethBalance = BigNumber(await this.web3.eth.getBalance(address));
            const totalSupply = BigNumber(await this.erc20TokenContract.methods.totalSupply().call());
            const allowance = BigNumber(await this.erc20TokenContract.methods.allowance(address, Config.ETH_BRIDGE_CONTRACT_ADDRESS).call());

            if (allowance.lt(this.TOKEN_ALLOWANCE_THRESHOLD)) {
                if (fee.gt(this.MAX_GAS_PRICE)) {
                    this.log('Current gas price is too high.');
                } else if (fee.gt(ethBalance)) {
                    this.log('Current fee is larger than ETH balance.');
                } else {
                    this.approveSpender(totalSupply, currentGasPrice, address, privateKey);
                }
            }
        }

        res.send({
            code: 200,
            msg: 'Wallet is added'
        });
    } catch (error) {
        this.log(error);
        res.send({
            code: 200,
            msg: error.message
        });
    }
}

PayerAPI.prototype.delete = function (req, res) {
    const { address, network } = req.body;

    const result = WalletManager.deleteWallet(address, network);

    let obj = result ?
        { code: 200, msg: `Wallet ${address} is deleted` } :
        { code: 404, msg: `Wallet not found` };

    res.send(obj);
}

PayerAPI.prototype.getWallets = function (req, res) {
    let wallets = WalletManager.getWallets();
    res.send({
        code: 200,
        data: wallets
    });
}

module.exports = PayerAPI;
