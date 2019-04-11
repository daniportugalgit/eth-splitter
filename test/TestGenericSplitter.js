const GenericSplitter = artifacts.require("../contracts/GenericSplitter.sol");

contract("GenericSplitter", accounts => {
	//console.log(accounts);
	let _accounts = accounts;

	it("should be able to send ETH", function() {
		let instance;

		return GenericSplitter.deployed()
			.then(_instance => {
				instance = _instance;
				return instance.splitMyMoney.call(_accounts[1], _accounts[2], {from: _accounts[0], value:1000000000000000000});
			})
			.then(success => {
				assert.equal(_accounts[1].balance, 1010000000000000000, "Error 1");
				assert.equal(_accounts[2].balance, 1010000000000000000, "Error 2");
				assert.equal(_accounts[0].balance, 990000000000000000, "Error 3");
			});
	});
});