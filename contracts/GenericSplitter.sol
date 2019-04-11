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

contract GenericSplitter {
	using SafeMath for uint;
		
	mapping(address => uint) public balances;

	event MoneySplitted(uint totalAmount, address indexed from, address indexed beneficiary1, address indexed beneficiary2);

	function splitMyMoney(uint amount, address payable beneficiary1, address payable beneficiary2) public payable {
		require(msg.value + balances[msg.sender] >= amount, "Insufficient ETH sent.");
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

	function withdraw() public {
		require(balances[msg.sender] > 0, "Insufficient funds.");

		uint amount = balances[msg.sender];
		balances[msg.sender] = 0;
		msg.sender.transfer(amount);
	}

	//Fallback: not interested in donations.
	function() external {
		revert();
	}
}