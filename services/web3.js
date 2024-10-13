'use strict'
const Web3 = require("web3");

const init = (evmRPC) => {
  const provider = new Web3.providers.HttpProvider(evmRPC);
  const web3 = new Web3(provider);

  const isConnect = () => {
    return new Promise((resolve, reject) => {
      web3.eth.net
        .isListening()
        .then(() => {
          resolve(true);
        })
        .catch((e) => {
          reject(e)
        }); 
    });
  };

  const contract = (abi, address, decimals) => {
    // set token contract instance
    const sc = new web3.eth.Contract(abi, address);
    // include contract data
    sc.address = address;
    sc.decimals = decimals;
    
    const estimateTxGas = async ({ from, to, amount }) => {
      // Amount props if you want to send all balance of token in wallet set amount = "max"
      if (!from || !to || !amount) throw new Error('missing params')
    
      // Set transcation
      const decimal = 10 ** sc.decimals
      const amountInWei = amount === "max" ? await sc.methods.balanceOf(from).call() : (amount * decimal).toString();
    
      // Gas options
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = await sc.methods.transfer(to, amountInWei).estimateGas({ from });
  
      const gas = (gasPrice * gasLimit) / 10 ** 18;
      return gas;
    };
  
    const sendBalance = async ({ from, to, amount, privateKey }) => {
      // Amount props if you want to send all balance of token in wallet set amount = "max"
      if (!from || !to || !amount || !privateKey) throw new Error('missing params');
    
      // Set transaction amount
      const decimal = 10 ** (sc.decimals)
      const amountInWei = amount === "max" ? await sc.methods.balanceOf(from).call() : (amount ** decimal).toString();
    
      // Gas options
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = await sc.methods.transfer(to, amountInWei).estimateGas({ from });
    
      // Raw transaction
      const rawTranscation = {
        from,
        to: sc.address,
        gas: gasLimit,
        gasPrice: gasPrice,
        data: sc.methods.transfer(to, amountInWei).encodeABI()
      };
    
      //Sign transaction
      const tx = await web3.eth.accounts.signTransaction(rawTranscation, privateKey)
      const receipt = await web3.eth.sendSignedTransaction(tx.rawTransaction)
      return receipt;
    };
  
    return { estimateTxGas, sendBalance }
  }

  const getBalance = async (address, inEther) => {
    const balance = await web3.eth.getBalance(address);
    return inEther ? balance : (balance / 10 ** 18)
  }
  
  const sendBalance = async ({ from, to, amount, privateKey }) => {
    // Amount props if you want to send all balance of token in wallet set amount = "max"
    if (!from || !to || !amount || !privateKey) throw new Error('missing params');
  
    // Set transaction amount
    const decimal = 18
    let amountInWei = amount === "max" ? await getBalance(from, true) : (amount * (10 ** decimal)).toString();
  
    // Gas options
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = await web3.eth.estimateGas({ from, to, value: amountInWei });
  
    // Calculate amount to pay gas
    if (amount === 'max') {
      const gasValue = gasPrice * gasLimit
      amountInWei = amountInWei - gasValue
    }
  
    // Raw transaction
    const rawTranscation = {
      from,
      to,
      value: amountInWei,
      gas: gasLimit,
      gasPrice: gasPrice,
    };
  
    //Sign transaction
    const tx = await web3.eth.accounts.signTransaction(rawTranscation, privateKey)
    const receipt = await web3.eth.sendSignedTransaction(tx.rawTransaction)
    return receipt;
  }

  return {
    web3,
    isConnect,
    contract,
    getBalance,
    sendBalance,
  }
}

module.exports = { init, Web3 }
