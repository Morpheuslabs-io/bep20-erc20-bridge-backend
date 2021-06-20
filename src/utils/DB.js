"use strict"

const mongoose = require('mongoose');
const inherits = require('util').inherits;
const Constant = require('./Constant');
const BaseComponent = require("../BaseComponent");
const Config = require("../config/Config");

const {
    BscEventSchema,
    ConfigSchema,
    EthEventSchema,
} = require('../entities');

const DB = function () {
    this.connection = void 0;
}

inherits(DB, BaseComponent);

DB.prototype.init = async function () {
    await mongoose.connect(
        Config.MONGO.URL,
        {
            user: Config.MONGO.USERNAME,
            pass: Config.MONGO.PASSWORD,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            authSource: 'admin',
        }
    );

    this.connection = mongoose.connection;
    this.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

    this.BscEventModel = mongoose.model('BscEvent', BscEventSchema);
    this.ConfigModel = mongoose.model('Config', ConfigSchema);
    this.EthEventModel = mongoose.model('EthEvent', EthEventSchema);

    const bscStartBlockResult = await this.getConfig('bscStartBlock');
    if (!bscStartBlockResult) this.setConfig('bscStartBlock', Config.BSC_START_BLOCK);

    const ethStartBlockResult = await this.getConfig('ethStartBlock');
    if (!ethStartBlockResult) this.setConfig('ethStartBlock', Config.ETH_START_BLOCK);

    this.log("DB is ready");
}

DB.prototype.getConfig = async function (id) {
    const result = await this.ConfigModel.findOne({
        _id: id,
    });

    return result ? result.value : null;
}

DB.prototype.setConfig = async function (id, value) {
    await this.ConfigModel.updateOne({
        _id: id
    }, {
        value: value
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    });
}

DB.prototype.setBSCEvent = async function (event) {
    await this.BscEventModel.updateOne({
        _id: event._id
    }, event, {
        upsert: true,
        setDefaultsOnInsert: true
    })

}

DB.prototype.setEthEvent = async function (event) {
    await this.EthEventModel.updateOne({
        _id: event._id
    }, event, {
        upsert: true,
        setDefaultsOnInsert: true
    });
}

DB.prototype.getUnprocessedEvents = async function (network) {
    return network === Constant.NETWORK.ETH
        ? await this.EthEventModel.find({
            isProcessed: false,
        }).sort([['blockNumber', 1]])
        : await this.BscEventModel.find({
            isProcessed: false,
        }).sort([['blockNumber', 1]]);
}

DB.prototype.getEvent = async function (network, txHash) {
    return network === Constant.NETWORK.ETH
        ? await this.EthEventModel.findOne({
            _id: txHash,
        })
        : await this.BscEventModel.findOne({
            _id: txHash,
        });
}

DB.prototype.getEventByReceiptHash = async function (network, receiptHash) {
    return network === Constant.NETWORK.ETH
        ? await this.EthEventModel.find({
            receiptHash: receiptHash,
        })
        : await this.BscEventModel.find({
            receiptHash: receiptHash,
        });
}

module.exports = new DB();
