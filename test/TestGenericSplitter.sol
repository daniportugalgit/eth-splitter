//WIP!

pragma solidity 0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "..contracts/GenericSplitter.sol";

contract TestGenericSplitter {
	GenericSplitter splitter = GenericSplitter(DeployedAddresses.GenericSplitter());

	uint amountToSplit = 1 ether;
	address bob = XXXXXX;
	address carol = XXXXXX;
	address alice = address(this);

	function testSplit() public {
		splitter.splitMyMoney(bob, carol, {from: alice})
	}
}
