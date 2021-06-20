# Run on local

1. Start ganache-cli with command

```

ganache-cli -m="vacant various phone mail spirit resemble license umbrella replace never soon boring"

```

2. Deploy ERC20 test token
3. Deploy ETHSwap contract in eth folder from brigde smart contract repo

```
truffle migrate
```

4. Deploy BEP20 token and BSCSWap contracts on bsc folder brigde smart contract repo 

```
truffle migrate
```

5. Start mongoDB on local

6. Start backend service
```
./start.sh
```

7. Run ` node testE2B.js ` to swap token from Ethereum to BSC network
8. Run ` node testB2E.js ` to swap token from BSC network to Ethereum