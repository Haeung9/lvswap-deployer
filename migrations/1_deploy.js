var Factory = artifacts.require("UniswapV2Factory");
var Router = artifacts.require("UniswapV2Router02");
var WETH = artifacts.require("WETH9");

module.exports = async function(deployer, network, accounts) {
    let deployerAccount = accounts[0];

    await deployer.deploy(WETH, {from: deployerAccount});
    let wethAddress = (await WETH.deployed()).address;
    
    await deployer.deploy(Factory, deployerAccount, {from: deployerAccount});
    const factory = await Factory.deployed();

    await deployer.deploy(Router, factory.address, wethAddress, {from: deployerAccount});
    const router = await Router.deployed();

    await factory.setRouter(router.address);

    console.log("deployer address: ", deployerAccount)
    console.log("factory deployed: ", factory.address);
    console.log("weth deployed: ", wethAddress);
    console.log("router deployed: ", router.address);
    console.log("router set: ", (await factory.router()).toString());
};