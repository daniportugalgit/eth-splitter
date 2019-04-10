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

contract OwnedByAlice {
	address payable public alice;

	constructor() public {
		alice = msg.sender;
	}

	modifier onlyAlice() {
		require(msg.sender == alice, "You are not Alice! You may keep your head. For now.");
		_;
	}

	modifier isNotAlice() {
		require(msg.sender != alice, "You are Alice! This function is not for you. Off with her head!");
		_;
	}
}

contract StrictSplitter is OwnedByAlice {
	using SafeMath for uint;

	bool public isReady;
	uint public totalMoneySentFromAlice;
	address payable public bob;
	address payable public carol;
	mapping(address => uint) public balances;

	event BeneficiariesReset(address indexed oldBob, address indexed oldCarol);
	event BeneficiariesChanged(address indexed bob, address indexed carol);
	event MoneySplitted(uint totalAmount, address indexed bob, address indexed carol);

	modifier onlyAfterReady() {
		require(isReady == true, "There are no registered beneficiaries.");
		_;
	}

	modifier onlyBeforeReady() {
		require(isReady == false, "For safety, you must first call resetBeneficiaries() in order to be able to call this function again. Do you know what you are doing, my dear?");
		_;
	}

	function registerBeneficiaries(address payable _bob, address payable _carol) public onlyAlice onlyBeforeReady {
		require(_bob != address(0), "The address passed for Bob is wrong."); //would burn tokens
		require(_carol != address(0), "The address passed for Carol is wrong."); //would burn tokens
		require(_bob != alice && _carol != alice, "You cannot be a beneficiary of the split."); //would cheat
		require(_bob != _carol, "Both addresses are the same. This is forbidden."); //would not actually split anything

		bob = _bob;
		carol = _carol;

		isReady = true;

		emit BeneficiariesChanged(bob, carol);
	}

	//Guarantees Alice knows what she's doing before changing the beneficiaries; old beneficiaries will still be able to withdraw funds.
	function resetBeneficiaries() public onlyAlice onlyAfterReady {
		isReady = false;

		emit BeneficiariesReset(bob, carol);

		bob = address(0);
		carol = address(0);
	}

	function splitMyMoney() public payable onlyAlice onlyAfterReady {
		require(msg.value > 0, "You must send ETH.");

		uint bobsPart = msg.value.div(2);
		uint carolsPart = msg.value.sub(bobsPart);

		balances[bob] = balances[bob].add(bobsPart);
		balances[carol] = balances[carol].add(carolsPart);
		totalMoneySentFromAlice = totalMoneySentFromAlice.add(msg.value);

		emit MoneySplitted(msg.value, bob, carol);
	}

	//According to the briefing, Alice's balance will always be 0, since every wei she sends will be immediately split between Bob and Carol.
	function withdraw() public isNotAlice {
		require(balances[msg.sender] > 0, "Insufficient funds.");

		uint amount = balances[msg.sender];
		balances[msg.sender] = 0;
		msg.sender.transfer(amount);
	}

	function totalBalance() public view returns (uint) {
		return address(this).balance;
	}

	//Fallback: not interested in donations. Alice must use splitMyMoney(), as the briefing clearely states ("whenever Alice sends ether to the contract FOR IT TO BE SPLIT...")
	function() external {
		revert();
	}
}