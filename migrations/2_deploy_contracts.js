var CryptoFlightFactory = artifacts.require('./CryptoFlightFactory.sol');
var CFToken = artifacts.require('./CFToken.sol');

module.exports = deployer => {
  deployer.deploy(CFToken, 1000, 'CFToken', 'CFT').then(() => {
    return deployer.deploy(CryptoFlightFactory, CFToken.address);
  });
};
