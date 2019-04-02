# CryptoFlight

## Course project in CSCI5590 - Advanced Topics in Blockchain

_The Chinese University of Hong Kong, Spring 2019_

Read the tutorial to build your own version: [csci5590.andyafk.com](https://csci5590.andyafk.com)

Video walkthrough: [youtu.be/UvvvXHdT3hE](https://youtu.be/UvvvXHdT3hE)

Or try the app yourself at [cryptoflight.andyafk.com](https://cryptoflight.andyafk.com)
(MetaMask is required, use the Ropsten testnet)

### Just tell me how to get up and running

First, make sure you have MetaMask installed in your browser and a local blockchain running on port 7545

1. run `npm install` inside CryptoFlight
2. `cd client` and `npm install` dependencies for the client
3. `cd ..`
4. run `truffle compile`
5. run `truffle migrate --network dev --reset`
6. `cd client` and `npm start`
7. navigate to localhost:3000 in your browser
8. connect the dapp with MetaMask (and make sure it's set to use localhost)
9. all set, enjoy CryptoFlight!

### But I wanna deploy to Ropsten

To deploy to Ropsten we will make use of Infura for deploying to the testnet. Go to [infura.io](https://infura.io) and obtain an API-key for the Ropsten network. You will get an endpoint that looks like ropsten.infura.io/v3/\[YOUR_API_KEY\]. Copy this key and add it as the second argument to HDWalletProvider in truffle-config.js (there's a constant defined for it on line 3). You will also need the mnemonic for your ethereum wallet that you will be using to deploy the contracts. There's a constant defined for this on line 4 in the same file. Note that if you plan to build a real project it's safer to put these in a safe place and not directly in the source code. And, never ever push these credentials to github.

Now the only thing left is to deploy the contracts to Ropsten instead of your local testnet. Navigate to the root folder of the project (the same folder as this file is located in) then:

1. run `npm install` inside CryptoFlight
2. `cd client` and `npm install` dependencies for the client
3. `cd ..`
4. run `truffle compile`
5. `truffle migrate --network ropsten --reset`
6. open `client/src/config.js`
7. replace the address for `cfTokenAddress` on line 2 with the address to CFToken
8. and replace the address for `cryptoFlightFactoryAddress` on line 2 with the address to CryptoFlightFactory
9. set the `NODE_ENV` environment variable to `"production"`. How you do this depends on your OS, in Ubuntu you can just add a line to `/etc/environment`
10. `cd ..` and `npm start`
11. navigate to localhost:3000 in your browser
12. connect the dapp with MetaMask (and make sure it's set to use Ropsten)
13. all set, enjoy CryptoFlight, this time on the Ropsten network!

### Any questions?

Drop me an email at hello@andyafk.com!
