'use strict'
const { hdkey } = require('ethereumjs-wallet')
const bip39 = require('bip39');

//Derivation Path
// m’ / purpose’ / coin_type’ / account’ / change / address_index
// Ethereum — m’/44’/60’/0’/0
// Ethereum Classic — m’/44’/61’/0’/0
// Testnet (all coins) — m’/44’/1’/0’/0
// https://github.com/satoshilabs/slips/blob/master/slip-0044.md

const generateMnemonic = () => {
  // create a 12 word seed phrase
  const mnemonic = bip39.generateMnemonic(128)
  return mnemonic
}

const init = (mnemonic, path) => {
  // Bip39 only if you use mnemonic seed
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString();

  // Obtain master wallet
  const masterWallet = hdkey.fromMasterSeed(seed);

  function getWallet(walletID = 0) {
    // Obtain user wallet using derivation path, 
    // walletId is an integer between 0 and 2^31-1
  
    // For security reasons you likely use a different path
    // and have to understand the difference between
    // normal and hardened keys
    const userPath = `${path}/${walletID}`
    const userWallet = masterWallet.derivePath(userPath).getWallet();
  
    const stringWallet = {
      "address": userWallet.getAddressString(),
      "privateKey": userWallet.getPrivateKeyString(),
      "publicKey": userWallet.getPublicKeyString()
    }
  
    return stringWallet;
  }

  return { getWallet }
}

module.exports = { init, generateMnemonic }
