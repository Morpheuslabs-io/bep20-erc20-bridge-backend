"use strict";

const inherits = require('util').inherits;
const Base = require("../BaseComponent");
const Util = require("../utils/Util");

const WalletManager = function () {
    this._wallets = [];
}
inherits(WalletManager, Base);

WalletManager.prototype.getWallets = function (network) {
    if (network)
        return this._wallets.filter(w => w.network == network);
    return this._wallets;
}
WalletManager.prototype.getWallet = function (address, network) {
    return this._wallets.filter(w => w.address === address && w.network === network);
}

WalletManager.prototype.addWallet = function (address, privateKey, network) {
    const wallets = this._wallets.filter(w => Util.compareAddress(w.address, address) && w.network === network);

    if (wallets.length > 0) {
        this.log(`Wallet ${network}-${address} already exists.`);
        return false;
    }

    this._wallets.push({
        address: address,
        privateKey: privateKey,
        network: network,
        isInUsed: false,
    });

    this.log(`Wallet ${network}-${address} added.`);
    return true;
}

WalletManager.prototype.deleteWallet = function (address, network) {
    const wallets = this._wallets.filter(w => Util.compareAddress(w.address, address) && w.network === network);

    if (wallets.length == 0) {
        this.log(`Wallet ${network}-${address} not found.`);
        return false;
    }

    this._wallets = this._wallets.filter(w => w.address !== address || w.network !== network);

    this.log(`Wallet ${network}-${address} deleted.`);
    return true;
}

WalletManager.prototype.setIsInUsed = function (address, network, isInUsed) {
    const wallets = this._wallets.filter(w => Util.compareAddress(w.address, address) && w.network === network);

    if (wallets.length === 0) {
        this.log(`Wallet ${network}-${address} not found.`);
        return false;
    }

    wallets[0].isInUsed = isInUsed;

    this.log(`Wallet ${network}-${address} is in used: ${isInUsed}`);
    return true;
}

module.exports = new WalletManager();