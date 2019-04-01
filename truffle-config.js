const path = require('path');
const HDWalletProvider = require('truffle-hdwallet-provider');
const PROVIDER = '';
const MNEMONIC = '';

module.exports = {
  networks: {
    dev: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*'
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, PROVIDER);
      },
      network_id: 3,
      gas: 4000000
    }
  },
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
