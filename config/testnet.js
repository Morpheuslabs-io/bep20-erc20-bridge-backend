const Web3 = require('web3');

const env = {

    ////////
    // BSC 
    /////////
    // BSC_PROVIDER: new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/'),
    BSC_PROVIDER: new Web3('http://localhost:8545'),
    BSC_DELAY_BLOCK_COUNT: 2, // PRODUCTION should set 12 or 24  to make sure tx to finalize
    BSC_START_BLOCK: 0,
    BSC_BRIDGE_CONTRACT_ADDRESS: "0xB10c7d0ea0d256F55B4FdA3b679655Ea84580b89",
    BSC_SWAP_GASPRICE_LIMIT: 50, // 50 gwei

    ////////
    // ETH 
    /////////
    // ETH_PROVIDER: new Web3('https://ropsten.infura.io/v3/aa9447a39bfb4280b64c0b357d8c2d88'),
    ETH_PROVIDER: new Web3('http://localhost:8545'),
    ETH_DELAY_BLOCK_COUNT: 2, // PRODUCTION should set 6 or 12 to make sure tx to finalize
    ETH_START_BLOCK: 0,
    ETH_TOKEN_ADDRESS: "0x73B09649DBf09FDc6bBdBe2679aBd745e0f5771b",
    ETH_BRIDGE_CONTRACT_ADDRESS: "0x3033B1Da883AE09f6f0E462c824E516C44043304",
    ETH_SWAP_GASPRICE_LIMIT: 300, // 300 gwei
    ETH_TOKEN_ALLOWANCE_THRESHOLD: 10000,


    //////
    // MongoDB
    ///////
    MONGO: {
        URL: 'mongodb://127.0.0.1:27017',
        USERNAME: '',
        PASSWORD: ''
    },

    /////
    // General
    ///////

    EVENT_SCAN_INTERVAL: 1, // 1 minute
    EVENT_PAYER_INTERVAL: 1, // 1 minute

    MAX_EVENTS_IN_BATCH: 50
}

module.exports = env;