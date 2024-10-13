'use strict';

const web3Service = require('./services/web3');
const walletService = require('./services/wallet');

const Web3 = web3Service.Web3;

module.exports = {
  web3Service,
  walletService,
  Web3
};
