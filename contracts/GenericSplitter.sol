pragma solidity 0.5.0;

import "./Pausable.sol";
import "./SafeMath.sol";

contract GenericSplitter is Pausable {
	using SafeMath for uint;

	mapping(address => uint) public balances;

	event MoneySplitted(address indexed from, uint amount, address indexed beneficiary1, address indexed beneficiary2);
	event Withdrawal(address indexed from, uint amount);

	function splitMyMoney(address payable beneficiary1, address payable beneficiary2) public payable onlyReady {
		require(msg.value > 0, "You must send some ETH.");
		require(beneficiary1 != address(0) && beneficiary2 != address(0), "Please verify the beneficiaries addresses."); //would burn tokens
		require(beneficiary1 != msg.sender && beneficiary2 != msg.sender, "You cannot be a beneficiary of the split."); //would cheat
		require(beneficiary1 != beneficiary2, "Both addresses are the same. This is forbidden."); //would not actually split anything

		uint half = msg.value.div(2);
		uint remaining = msg.value.sub(half.mul(2));
		
		balances[beneficiary1] = balances[beneficiary1].add(half);
		balances[beneficiary2] = balances[beneficiary2].add(half);

		if(remaining != 0) {
			balances[msg.sender] = balances[msg.sender].add(remaining);
		}
	
		emit MoneySplitted(msg.sender, msg.value, beneficiary1, beneficiary2);
	}

	function withdraw() public onlyReady {
		uint amount = balances[msg.sender];
		require(amount > 0, "Insufficient funds.");
		
		emit Withdrawal(msg.sender, amount);
		balances[msg.sender] = 0;
		msg.sender.transfer(amount);
	}

	function() external {
		revert();
	}
}