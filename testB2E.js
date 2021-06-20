const Web3 = require('web3');

const web3 = new Web3('http://localhost:8545')
const abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }];
const bscTokenAddress = "0x047b42334Bfc74FC9710f05C5B937b6880880B54";

const swapABI = [{ "inputs": [{ "internalType": "uint256", "name": "fee", "type": "uint256" }, { "internalType": "bytes32", "name": "ethSwapInitTxHash", "type": "bytes32" }, { "internalType": "address", "name": "erc20Addr", "type": "address" }, { "internalType": "address", "name": "bep20Addr", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "bep20Addr", "type": "address" }, { "indexed": true, "internalType": "bytes32", "name": "ethTxHash", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "toAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "SwapFilled", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "bep20Addr", "type": "address" }, { "indexed": true, "internalType": "address", "name": "erc20Addr", "type": "address" }, { "indexed": true, "internalType": "address", "name": "fromAddr", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feeAmount", "type": "uint256" }], "name": "SwapStarted", "type": "event" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "filledETHTx", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "addresspayable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "swapFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "whitelist", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "addWhitelist", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "removeWhitelist", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "addresspayable", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "addresspayable", "name": "newOwner", "type": "address" }], "name": "transferOwnershipOfToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "setSwapFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32[]", "name": "ethTxHashArr", "type": "bytes32[]" }, { "internalType": "address[]", "name": "toAddressArr", "type": "address[]" }, { "internalType": "uint256[]", "name": "amountArr", "type": "uint256[]" }], "name": "fillETH2BSCSwap", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "swapBSC2ETH", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function", "payable": true }];
const swapAddress = "0xB10c7d0ea0d256F55B4FdA3b679655Ea84580b89";

const tokenProviderPrivateKey = "0xd172a8ff67792f6cefec0621dc84a9436d33f547acfd30a22550914613fa4fee";

let tokenContract = new web3.eth.Contract(abi, bscTokenAddress);
let swapContract = new web3.eth.Contract(swapABI, swapAddress);

async function approve(amount) {

    const account = web3.eth.accounts.privateKeyToAccount(tokenProviderPrivateKey);
    amount = web3.utils.toWei(`${amount}`, "ether");

    let nonce = await web3.eth.getTransactionCount(account.address);
    let payload = await tokenContract.methods.approve(swapAddress, amount).encodeABI();

    let tx = {
        from: account.address,
        to: tokenContract._address,
        gasPrice: 20000000000,
        gas: 100000,
        value: 0,
        nonce,
        data: payload
    };

    let signedTx = await account.signTransaction(tx);
    let txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    // console.log("Approve tx", txReceipt);
}

async function swap(amount) {

    const account = web3.eth.accounts.privateKeyToAccount(tokenProviderPrivateKey);

    amount = web3.utils.toWei(`${amount}`, "ether");
    let nonce = await web3.eth.getTransactionCount(account.address);
    let payload = await swapContract.methods.swapBSC2ETH(amount).encodeABI();

    let tx = {
        from: account.address,
        to: swapAddress,
        gasPrice: 20000000000,
        gas: 1000000,
        value: 0,
        nonce,
        data: payload
    };

    let signedTx = await account.signTransaction(tx);
    let txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("Swap tx", txReceipt.transactionHash, txReceipt.blockNumber);
}

async function main(number) {
    let amount = 100;
    for (let i = 0; i < number; i++) {
        await approve(amount);
        await swap(amount);
    }
}

async function checkBalance(address) {
    let balance = await tokenContract.methods.balanceOf(address).call();
    console.log(balance);
}

main(5);
//checkBalance(spenderAddress);