const truffleAssert = require('truffle-assertions');
const GenericSplitter = artifacts.require("GenericSplitter");

contract("Generic Splitter", accounts => {
	const [account0, account1, account2, account3, account4] = accounts;
	let _instance;

	beforeEach('setup contract for each test', async function () {
        _instance = await GenericSplitter.new({from:account0});
    })

	it("should split correctly when value is even and user sends all the needed ETH", async () => {
		await _instance.splitMyMoney(account2, account3, {from: account1, value:100})
		let balance1 = await _instance.balances.call(account1);
		let balance2 = await _instance.balances.call(account2);
		let balance3 = await _instance.balances.call(account3);

		assert.strictEqual(balance1.toString(10), "0", "Account1 does not have the correct amount after split.");
		assert.strictEqual(balance2.toString(10), "50", "Account2 does not have the correct amount after split.");
		assert.strictEqual(balance3.toString(10), "50", "Account3 does not have the correct amount after split.");
	});

	it("should split correctly when value is odd and user sends all the needed ETH", async () => {
		await _instance.splitMyMoney(account2, account3, {from: account1, value:101})
		let balance1 = await _instance.balances.call(account1);
		let balance2 = await _instance.balances.call(account2);
		let balance3 = await _instance.balances.call(account3);

		assert.strictEqual(balance1.toString(10), "1", "Account1 does not have the correct amount after split.");
		assert.strictEqual(balance2.toString(10), "50", "Account2 does not have the correct amount after split.");
		assert.strictEqual(balance3.toString(10), "50", "Account3 does not have the correct amount after split.");
	});

	it("should REVERT the split when msg.sender equals (beneficiary1 || beneficiary2)", async () => {
		await truffleAssert.reverts(_instance.splitMyMoney(account1, account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary1 is the same as msg.sender");
		await truffleAssert.reverts(_instance.splitMyMoney(account2, account1, {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary2 is the same as msg.sender");
	});

	it("should REVERT the split when beneficiary1 equals 0 or beneficiary2 equals 0", async () => {
		await truffleAssert.reverts(_instance.splitMyMoney("0x0000000000000000000000000000000000000000", account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary1 is address(0)");
		await truffleAssert.reverts(_instance.splitMyMoney(account2, "0x0000000000000000000000000000000000000000", {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary2 is address(0)");
	});

	it("should REVERT the split when beneficiary1 == beneficiary2", async () => {
		await truffleAssert.reverts(_instance.splitMyMoney(account2, account2, {from: account1, value:100}), truffleAssert.ErrorType.REVERT);
	});

	it("should be able to withdraw if balance > 0, then balance should become 0", async () => {
		await _instance.splitMyMoney(account2, account3, {from: account1, value:100}); //account1 deposits 50 in account2 and 50 in account3
		await truffleAssert.passes(_instance.withdraw({from: account2}), "Unable to withdraw even having funds.");
		let balance = await _instance.balances.call(account2);
		assert.strictEqual(balance.toString(10), "0", "After withdraw funds did not go to zero.");
	});

	it("should REVERT the withdraw if balance == 0", async () => {
		await truffleAssert.reverts(_instance.withdraw({from: account1}), truffleAssert.ErrorType.REVERT);
	});
	
	it("should actually transfer ETH when someone withdraws", async () => {
		let balanceBefore = await web3.eth.getBalance(account4);

		await _instance.splitMyMoney(account2, account4, {from: account1, value:100, gasPrice:10}); //account1 deposits 50 in account2 and 50 in account3
		let tx = await _instance.withdraw({from: account4});
		let receipt = tx.receipt;
				
		let gasPrice = await web3.eth.getGasPrice();
		let gasCost = gasPrice * receipt.gasUsed;
		assert.strictEqual("21484", receipt.gasUsed.toString(10), "Gas used is wrong.");
		
		let expected = web3.utils.toBN(balanceBefore).add(web3.utils.toBN(50)).sub(web3.utils.toBN(gasCost));
		let balanceAfter = await web3.eth.getBalance(account4);

		assert.strictEqual(balanceAfter.toString(10), expected.toString(10), "User has not received ETH after withdraw.");
	});
});