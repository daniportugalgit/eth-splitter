pragma solidity 0.5.0;

import "./Ownable.sol";

contract Pausable is Ownable {
	bool public isPaused;
	
	event ContractPaused(address indexed pausedBy);
	event ContractResumed(address indexed resumedBy);
	event ContractDestroyed(address indexed destroyedBy);
	
	modifier onlyPaused() {
		require(isPaused == true, "The contract must be paused to perform this action.");
		_;
	}

	modifier onlyReady() {
		require(isPaused == false, "The contract is paused at the moment. Please contact the administrator.");
		_;
	}

	function pause() public onlyOwner onlyReady {
		isPaused = true;
		emit ContractPaused(owner);
	}

	function resume() public onlyOwner onlyPaused {
		isPaused = false;
		emit ContractResumed(owner);
	}

	function killContract() public onlyOwner onlyPaused {
		emit ContractDestroyed(owner);
		selfdestruct(owner);
	}
}