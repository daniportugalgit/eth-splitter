/*

This is a generic version of the Splitter. It is meant for anyone to use it (not just Alice, Bob and Carol).
Here, it's not necessary to register beneficiaries, nor to "own" the contract.
The user will pass the beneficiaries addresses whenever she wants to split funds.
It is also possible to use her local balance, instead of sending ether every time.

*/


pragma solidity 0.5.0;

library SafeMath {
	function add(uint a, uint b) internal pure returns(uint) {
		uint c = a + b;
		require(c >= a, "Sum Overflow!");

		return c;
	}

	function sub(uint a, uint b) internal pure returns(uint) {
		require(b <= a, "Sub Underflow!");
		uint c = a - b;

		return c;
	}

	function mul(uint a, uint b) internal pure returns(uint) {
		if(a == 0) {
			return 0;
		}

		uint c = a * b;
		require(c / a == b, "Mul Overflow!");

		return c;
	}

	function div(uint a, uint b) internal pure returns(uint) {
		uint c = a / b;

		return c;
	}
}

contract Ownable {
	address payable public owner;

	event OwnershipTransferred(address newOwner);

	constructor() public {
		owner = msg.sender;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "You are not the owner!");
		_;
	}

	function transferOwnership(address payable newOwner) onlyOwner public {
		owner = newOwner;

		emit OwnershipTransferred(owner);
	}
}

contract Pausable is Ownable {
	bool public isPaused; //works like a "soft pause": some actions may be performed while in this state.
	bool public isFrozen; //works like a "hard pause": only the owner may perform actions while in this state, and only specific actions may be executed even by the owner.

	event ContractPaused(address indexed pausedBy);
	event ContractResumed(address indexed resumedBy);
	event ContractFrozen(address indexed frozenBy);
	event ContractUnfrozen(address indexed unfrozenBy);

	modifier onlyPaused() {
		require(isPaused == true, "The contract must be paused to perform this action.");
		_;
	}

	modifier onlyNotPaused() {
		require(isPaused == false, "The contract is paused at the moment. Please contact the administrator.");
		_;
	}

	modifier onlyFrozen() {
		require(isFrozen == true, "The contract must be frozen to perform this action.");
		_;
	}

	modifier onlyNotFrozen() {
		require(isFrozen == false, "The contract is frozen. Winter is coming.");
		_;
	}

	modifier onlyReady() {
		require(isFrozen == false && isPaused == false, "The contract must be unpaused and unfrozen to perform this action.");
		_;
	}

	function pause() public onlyOwner {
		isPaused = true;
		emit ContractPaused(owner);
	}

	function resume() public onlyOwner {
		isPaused = false;
		emit ContractResumed(owner);
	}

	function freeze() public onlyOwner {
		isFrozen = true;
		emit ContractFrozen(owner);
	}

	function unfreeze() public onlyOwner {
		isFrozen = false;
		emit ContractUnfrozen(owner);
	}
}

contract GenericSplitter is Pausable {
	using SafeMath for uint;

	mapping(address => uint) public balances;

	event MoneySplitted(uint totalAmount, address indexed from, address indexed beneficiary1, address indexed beneficiary2);

	//The owner may pause (or freeze) this contract in order to prevent users from executing this function.
	function splitMyMoney(uint amount, address payable beneficiary1, address payable beneficiary2) public payable onlyReady {
		require(msg.value + balances[msg.sender] >= amount, "Insufficient ETH sent.");
		require(msg.value <= amount, "You are sending too much ether! Please review."); //user made a wrong calculation and would send excess ether
		require(beneficiary1 != address(0) && beneficiary2 != address(0), "Please verify the beneficiaries addresses."); //would burn tokens
		require(beneficiary1 != msg.sender && beneficiary2 != msg.sender, "You cannot be a beneficiary of the split."); //would cheat
		require(beneficiary1 != beneficiary2, "Both addresses are the same. This is forbidden."); //would not actually split anything

		uint half = amount.div(2);
		uint remaining = amount.sub(half.mul(2));

		balances[beneficiary1] = balances[beneficiary1].add(half);
		balances[beneficiary2] = balances[beneficiary2].add(half);
		balances[msg.sender] = balances[msg.sender].sub(amount.sub(msg.value)).add(remaining);
	
		emit MoneySplitted(amount, msg.sender, beneficiary1, beneficiary2);
	}

	//Users may withdraw from a paused contract.
	//That will allow us to inform users that the contract WILL be frozen or destroyed in a given timespan, so that they can withdraw their funds before it happens.
	function withdraw() public onlyNotFrozen {
		require(balances[msg.sender] > 0, "Insufficient funds.");

		uint amount = balances[msg.sender];
		balances[msg.sender] = 0;
		msg.sender.transfer(amount);
	}

	//For safety, the owner can only destroy this contract if it's frozen.
	function killContract() public onlyOwner onlyFrozen {
		selfdestruct(owner);
	}

	//Fallback: not interested in donations.
	function() external {
		revert();
	}
}