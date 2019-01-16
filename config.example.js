//Your private key
const privateKey = '0xYOURPRIVATEKEY'
//A web3 provider (ropsten)
const web3Provider = 'http://some.web3.provider.com'

//The vulnerable contract
const Entrance_contract_address = '0x1898Ed72826BEfa2D549004C57F048A95ae0B982'
//The callback ip (to be sent to the event)
const ip = '127.0.0.1'
//The callback port (to be sent to the event)
const port = '1234'

const poolInterval = 500

const gasPrice = '100000000000' //100 gwei (high but fast)

module.exports = {
  privateKey,
  web3Provider,
  Entrance_contract_address,
  ip,
  port,
  poolInterval,
  gasPrice
}
