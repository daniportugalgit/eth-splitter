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

	function splitMyMoney(address payable beneficiary1, address payable beneficiary2) public payable {
		require(msg.value > 0, "You must send ETH.");
		require(beneficiary1 != address(0) && beneficiary2 != address(0), "Please verify the beneficiaries addresses."); //would burn tokens
		require(beneficiary1 != msg.sender && beneficiary2 != msg.sender, "You cannot be a beneficiary of the split."); //would cheat
		require(beneficiary1 != beneficiary2, "Both addresses are the same. This is forbidden."); //would not actually split anything

		uint half = msg.value.div(2);
		uint remaining = msg.value.sub(half.mul(2));

		balances[beneficiary1] = balances[beneficiary1].add(half);
		balances[beneficiary2] = balances[beneficiary2].add(half);
		if(remaining > 0) {
			balances[msg.sender] = balances[msg.sender].add(remaining);
		}
		
		emit MoneySplitted(msg.value, msg.sender, beneficiary1, beneficiary2);
	}

	//This could be either controlled by the website transparently, or the user could have a checkbox when able to use her balance:
	//amount is in WEI!
	function splitMyLocalBalance(uint amount, address payable beneficiary1, address payable beneficiary2) public {
		require(balances[msg.sender] >= amount, "Insufficient balance.");
		require(beneficiary1 != address(0) && beneficiary2 != address(0), "Please verify the beneficiaries addresses."); //would burn tokens
		require(beneficiary1 != msg.sender && beneficiary2 != msg.sender, "You cannot be a beneficiary of the split."); //would cheat
		require(beneficiary1 != beneficiary2, "Both addresses are the same. This is forbidden."); //would not actually split anything

		uint b1Part = amount.div(2);
		uint b2Part = amount.sub(b1Part);

		balances[msg.sender] = balances[msg.sender].sub(amount);
		balances[beneficiary1] = balances[beneficiary1].add(b1Part);
		balances[beneficiary2] = balances[beneficiary2].add(b2Part);

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