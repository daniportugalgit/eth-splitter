pragma solidity 0.5.0;

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
		require (newOwner != address(0), "Please verify the new address.");
		require (newOwner != owner, "The new owner cannot be the same as the old owner.");

		owner = newOwner;

		emit OwnershipTransferred(owner);
	}
}