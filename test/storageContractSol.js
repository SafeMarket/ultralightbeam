module.exports =
  `pragma solidity ^0.4.4;
  contract Storage {
    uint public pos0;
    mapping(address => uint) public pos1;

    function Storage() payable {
      pos0 = 1234;
      pos1[msg.sender] = 5678;
    }
  }`
