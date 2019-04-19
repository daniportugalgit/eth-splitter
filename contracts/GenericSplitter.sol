pragma solidity 0.5.0;

import "./Pausable.sol";
import "./SafeMath.sol";

contract GenericSplitter is Pausable {
	using SafeMath for uint;

	mapping(address => uint) public balances;

	event MoneySplitted(uint totalAmount, address indexed from, address indexed beneficiary1, address indexed beneficiary2);
	event Withdrawal(uint amount, address indexed from);

	//@GAS with one SLOAD for balance: 70211 (current implementation)
	//@GAS with two SLOAD for balance: 70487
	//@GAS when there's no remaining: 69836
	//@GAS when there's    remaining: 90280
	function splitMyMoney(uint amount, address payable beneficiary1, address payable beneficiary2) public payable onlyReady {
		uint senderBalance = balances[msg.sender];
		require(msg.value + senderBalance >= amount, "Insufficient ETH sent.");
		require(msg.value <= amount, "You are sending too much ether! Please review."); //user made a wrong calculation and would send excess ether
		require(beneficiary1 != address(0) && beneficiary2 != address(0), "Please verify the beneficiaries addresses."); //would burn tokens
		require(beneficiary1 != msg.sender && beneficiary2 != msg.sender, "You cannot be a beneficiary of the split."); //would cheat
		require(beneficiary1 != beneficiary2, "Both addresses are the same. This is forbidden."); //would not actually split anything

		uint half = amount.div(2);
		uint remaining = amount.sub(half.mul(2));
		
		balances[beneficiary1] = balances[beneficiary1].add(half);
		balances[beneficiary2] = balances[beneficiary2].add(half);

		if(amount > msg.value || remaining != 0) {
			balances[msg.sender] = senderBalance.sub(amount.sub(msg.value)).add(remaining);
		}
	
		emit MoneySplitted(amount, msg.sender, beneficiary1, beneficiary2);
	}

	//@GAS with one SLOAD: 21484 (current implementation)
	//@GAS with two SLOAD: 21773
	function withdraw() public onlyReady {
		uint amount = balances[msg.sender];
		require(amount > 0, "Insufficient funds.");
		
		emit Withdrawal(amount, msg.sender); //emits before the transfer to maintain the natural order of events in case the recipient also emits an event upon receiving funds
		balances[msg.sender] = 0;
		msg.sender.transfer(amount);
	}

	function() external {
		revert();
	}
}