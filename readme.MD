# LVswap-deployer
## target source
https://github.com/cryptoecc/LVswap-core/tree/dev  
https://github.com/cryptoecc/LVswap-periphery/tree/dev

## install
```
yarn
```
## download source code
```
yarn download
```
## compile
```
yarn compile
```
## deploy
Set your own `HDWALLET_MNEMONIC` (and `INFURA_KEY`) on .env file.
### local test
```
yarn run ganache -D -m <YOUR_HDWALLET_MNEMONIC>
yarn localdeploy
```
### WorldLand Gwangju (testnet)
```
yarn testdeploy
```
### WorldLand Seoul (mainnet)
```
yarn deploy
```
