# Testnet Experiments
1. Deploy the contracts on `WorldLand Gwangju` test network
2. Interaction with the contracts using `truffle console`

# Preperation
## Contract deploy
```
yarn download
yarn compile
yarn testdeploy
yarn run truffle console --network worldland_gwangju
```

Note: The remaining of the scripts are run in truffle console:
```
truffle(worldland_gwangju)>
```

Note: In the remaining of this scripts, we omited meaningless returns, for example `undefined` below:
``` javascript
truffle(worldland_gwangju)> const isTokenSorted = tokenA.address < tokenB.address
undefined
```

# Results
## Deploy test tokens
Deploy two ERC-20 tokens, `tokenA` and `tokenB` for test.
``` javascript
truffle(worldland_gwangju)> let tokenA = await ERC20.new("1000000000000000000000000000")
truffle(worldland_gwangju)> let tokenB = await ERC20.new("10000000000000000000000000")
```
## Sort tokens
Sort tokens to compute `pair` address.
``` javascript
truffle(worldland_gwangju)> tokenA.address
'0x96BB8780Ea3a7e50F1Fc6d62B247c6D413060345'
truffle(worldland_gwangju)> tokenB.address
'0xf1269dF4aBAc5ea8F63436491a47696cDC5c44E4'
truffle(worldland_gwangju)> const isTokenSorted = tokenA.address < tokenB.address
truffle(worldland_gwangju)> isTokenSorted
true
truffle(worldland_gwangju)> const token0 = isTokenSorted ? tokenA : tokenB
truffle(worldland_gwangju)> const token1 = isTokenSorted ? tokenB : tokenA
truffle(worldland_gwangju)> token0.address
'0x96BB8780Ea3a7e50F1Fc6d62B247c6D413060345'
truffle(worldland_gwangju)> token1.address
'0xf1269dF4aBAc5ea8F63436491a47696cDC5c44E4'
```

## Set user account
Set user as an account connected to the provider.
``` javascript
truffle(worldland_gwangju)> let user = accounts[0]
truffle(worldland_gwangju)> user
'0x2Bb024a4e7b5453D9E40A439ACf411204413A3ac'
truffle(worldland_gwangju)> (await tokenA.balanceOf(user)).toString()
'1000000000000000000000000000'
```

## Set instances
Load contracts from their deployed addresses.
``` javascript
truffle(worldland_gwangju)> let router02 = await UniswapV2Router02.at("0xbB66cFAC2Fc7156F051785f3d4C1DA142A9C3b09")
truffle(worldland_gwangju)> let factory = await UniswapV2Factory.at("0x511DB00D13Cb58B07213Fc640F1Da20E0da0765C")
```

## Token approval
Approve `router02` to spend `tokenA` and `tokenB` of `user`.
``` javascript
truffle(worldland_gwangju)> (await tokenA.approve(router02.address, "1000000000000000000000000000")).receipt.transactionHash
'0x289c4180ec46ce237d662a7afb277e9fd27d4c3c21f02459915fbeeca0144b62'
truffle(worldland_gwangju)> (await tokenB.approve(router02.address, "10000000000000000000000000")).receipt.transactionHash
'0xe7340243f93080786ef273ebbbf21d155ebeacb11c09539bce1e18b68898e40d'
```

## Define getBlockNumber() and setDeadline()
Define several useful functions
``` javascript
truffle(worldland_gwangju)> async function getBlockNumber() {const latest = (await web3.eth.getBlock("latest")).number; const current = latest + 1; const next = current + 1; return {"latest": latest, "current": current, "next": next};}
truffle(worldland_gwangju)> async function setDeadline(expiry) {const blockGenerationTime = 15; const latestTimeStamp = (await web3.eth.getBlock("latest")).timestamp; return latestTimeStamp + blockGenerationTime + expiry;}
```

## Add liquidity
Provide liquidity of 100.0 `tokenA` and 100.0 `tokenB`.
We can see the transaction on: https://testscan.worldland.foundation/tx/0xd45e03d0a597c93c4cdbd349567a7fc75af043f9b959dfad9012b47e0b717b89
``` javascript
truffle(worldland_gwangju)> let deadline = await setDeadline(3600)
truffle(worldland_gwangju)> deadline
1695610907
truffle(worldland_gwangju)> (await router02.addLiquidity(tokenA.address, tokenB.address, "100000000000000000000", "100000000000000000000", "100000000000000000000", "100000000000000000000", user, deadline, {gas: 5000000})).receipt.transactionHash
'0xd45e03d0a597c93c4cdbd349567a7fc75af043f9b959dfad9012b47e0b717b89'
```
Check the created pair:
``` javascript
truffle(worldland_gwangju)> await factory.allPairs(0)
'0x1fDafD774c35Ba2F6Df555029c565cC2894acED7'
truffle(worldland_gwangju)> let pair = await UniswapV2Pair.at("0x1fDafD774c35Ba2F6Df555029c565cC2894acED7");
truffle(worldland_gwangju)> (await tokenA.balanceOf(pair.address)).toString()
'100000000000000000000'
truffle(worldland_gwangju)> (await tokenB.balanceOf(pair.address)).toString()
'100000000000000000000'
truffle(worldland_gwangju)> (await tokenA.balanceOf(user)).toString()
'999999900000000000000000000'
truffle(worldland_gwangju)> (await tokenB.balanceOf(user)).toString()
'9999900000000000000000000'
truffle(worldland_gwangju)> (await pair.balanceOf(user)).toString()
'99999999999999999000'
```

## Set market price
Set marketPrice = 1.0 for current block and the next 99 blocks.
We can see the transaction on: https://testscan.worldland.foundation/tx/0xc7cb4b752949623c1dd92602133f676fc6c20b8c9e4f72bbdaf2b8d91d5b579b
``` javascript
truffle(worldland_gwangju)> let prices = []
truffle(worldland_gwangju)> {for (let i = 0; i<100;  i++) {prices.push("1000000000000000000");}}
truffle(worldland_gwangju)> let swapPath = [token0.address, token1.address]
truffle(worldland_gwangju)> currentBlockNumber = (await getBlockNumber()).current
438750
truffle(worldland_gwangju)> (await router02.setMarketPricesAtPool(token0.address, token1.address, currentBlockNumber, prices)).receipt.transactionHash
'0xc7cb4b752949623c1dd92602133f676fc6c20b8c9e4f72bbdaf2b8d91d5b579b'
```
Check the prices.
``` javascript
truffle(worldland_gwangju)> (await pair.getMarketPrice(438750)).toString()
'1000000000000000000'
truffle(worldland_gwangju)> (await pair.getMarketPrice(438755)).toString()
'1000000000000000000'
```

## Swap token
Swap 1.0 `tokenA` for 0.987158034397061298 `tokenB`.
We can see the transaction on: https://testscan.worldland.foundation/tx/0xd6b648ba2533616e2bd83512144a0f43cf7723da3b650025522ce47cf9209c02
``` javascript
truffle(worldland_gwangju)> let deadline = await setDeadline(3600)
truffle(worldland_gwangju)> (await router02.swapExactTokensForTokens("1000000000000000000", "98715803439706129", swapPath, user, deadline, {gas:999999})).receipt.transactionHash
'0xd6b648ba2533616e2bd83512144a0f43cf7723da3b650025522ce47cf9209c02'
```
Check balances
``` javascript
truffle(worldland_gwangju)> (await token0.balanceOf(pair.address)).toString()
'101000000000000000000'
truffle(worldland_gwangju)> (await token1.balanceOf(pair.address)).toString()
'99012841965602938702'
truffle(worldland_gwangju)> (await tokenA.balanceOf(user)).toString()
'999999899000000000000000000'
truffle(worldland_gwangju)> (await tokenB.balanceOf(user)).toString()
'9999900987158034397061298'
```

## Remove liquidity
Remove all liquidity from `pair`.
We can see the transaction on: https://testscan.worldland.foundation/tx/0x94655d81d128385b316c79456f4c1bdcc7b954a228e807d3a1656d118b71e942
``` javascript
truffle(worldland_gwangju)> (await pair.balanceOf(user)).toString()
'99999999999999999000'
truffle(worldland_gwangju)> (await pair.approve(router02.address, "99999999999999999000")).receipt.transactionHash
'0xc8c7c2e28a31e95eb69b519c3608a1035ef4514fd5c42ce412a4e18ba694f107'
truffle(worldland_gwangju)> deadline = await setDeadline(3600)
1695622017
truffle(worldland_gwangju)> (await router02.removeLiquidity(tokenA.address, tokenB.address, '99999999999999999000', '100900000000000000000', '98912841965602938702', user, deadline)).receipt.transactionHash
'0x94655d81d128385b316c79456f4c1bdcc7b954a228e807d3a1656d118b71e942'
```
Check balances
``` javascript
truffle(worldland_gwangju)> (await pair.balanceOf(user)).toString()
'0'
truffle(worldland_gwangju)> (await tokenA.balanceOf(pair.address)).toString()
'1010'
truffle(worldland_gwangju)> (await tokenB.balanceOf(pair.address)).toString()
'991'
truffle(worldland_gwangju)> (await tokenA.balanceOf(user)).toString()
'999999999999999999999998990'
truffle(worldland_gwangju)> (await tokenB.balanceOf(user)).toString()
'9999999999999999999999009'
```
