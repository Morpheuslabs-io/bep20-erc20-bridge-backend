"use strict";

class Util {
    static getCurrentTime = () => {
        return new Date().getTime();
    };

    static getCurrentTimeInString = () => {
        return new Date().toISOString();
    };

    static fromWei = (web3, amount, unit = 'ether') => {
        return web3.utils.fromWei(amount.toString(), unit);
    };

    static toWei = (web3, amount, unit = 'ether') => {
        return web3.utils.toWei(amount.toString(), unit);
    };

    static splitToQueue = (data, numberOfQueue) => {
        let queue = {};
        const avgQueueLength = data.length / numberOfQueue;

        Array.from({ length: numberOfQueue }).forEach((_, index) => {
            queue[index] = data.slice(
                Math.floor(index * avgQueueLength),
                Math.floor((index + 1) * avgQueueLength)
            );
        });

        return queue;
    };

    static getBscGas = (bulkSize) => {
        if (bulkSize <= 5) return 487746;
        if (bulkSize <= 10) return 733210;
        if (bulkSize <= 20) return 904503;
        if (bulkSize <= 30) return 1333546;
        if (bulkSize <= 40) return 1533546;
        if (bulkSize <= 50) return 1933446;
        if (bulkSize <= 60) return 2333478;
        // if (bulkSize <= 70) return 2633446;
        // if (bulkSize <= 80) return 2855452;
        // if (bulkSize <= 90) return 3195322;
        // if (bulkSize <= 100) return 3345172;
        else return -1;
    }

    static getEthGas = (bulkSize) => {
        if (bulkSize <= 5) return 487746;
        if (bulkSize <= 10) return 733210;
        if (bulkSize <= 20) return 904503;
        if (bulkSize <= 30) return 1333546;
        if (bulkSize <= 40) return 1533546;
        if (bulkSize <= 50) return 1933446;
        if (bulkSize <= 60) return 2333478;
        // if (bulkSize <= 70) return 2633446;
        // if (bulkSize <= 80) return 2855452;
        // if (bulkSize <= 90) return 3195322;
        // if (bulkSize <= 100) return 3345172;
        else return -1;
    }

    static compareAddress = (addr1, addr2) => {
        addr1 = (addr1 || "").toLowerCase();
        addr2 = (addr2 || "").toLowerCase();

        return addr1 == addr2;
    }
}

module.exports = Util;
