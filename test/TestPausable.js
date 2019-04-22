const truffleAssert = require('truffle-assertions');
const GenericSplitter = artifacts.require("GenericSplitter");

contract("Pausable", accounts => {
	const [account0, account1, account2, account3, account4] = accounts;
	let _instance;

	beforeEach('setup contract for each test', async function () {
        _instance = await GenericSplitter.new({from:account0});
    })

    it("should let owner pause contract", async () => {
		await _instance.pause({from: account0});
		let isPaused = await _instance.isPaused.call();
		assert.strictEqual(isPaused, true, "Contract has not been paused.");
	});

	it("should let owner resume a paused contract", async () => {
		await _instance.pause({from: account0});
		await _instance.resume({from: account0});
		let isPaused = await _instance.isPaused.call();
		assert.strictEqual(isPaused, false, "Contract has not been resumed.");
	});

	it("should REVERT when owner tries to resume the contract if not paused", async () => {
		await truffleAssert.reverts(_instance.resume({from: account0}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT when not-owner tries to pause contract", async () => {
		await truffleAssert.reverts(_instance.pause({from: account1}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT when not-owner tries to resume a paused contract", async () => {
		await _instance.pause({from: account0});
		await truffleAssert.reverts(_instance.resume({from: account1}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT the split if contract is paused", async () => {
		await _instance.pause({from: account0});
		await truffleAssert.reverts(_instance.splitMyMoney(100, account2, account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT the withdraw if contract is paused", async () => {
		await _instance.splitMyMoney(100, account2, account3, {from: account1, value:100});
		await _instance.pause({from: account0});
		await truffleAssert.reverts(_instance.withdraw({from: account2}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT freezeContract if contract is not paused", async () => {
		await truffleAssert.reverts(_instance.freeze({from: account0}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT freezeContract if paused && msg.sender is not the owner", async () => {
		await _instance.pause({from: account0});
		await truffleAssert.reverts(_instance.freeze({from: account1}), truffleAssert.ErrorType.REVERT);
	});

	it("should let owner freeze contract if paused", async () => {
		await _instance.pause({from: account0});
		await _instance.freeze({from: account0});
		let isFrozen = await _instance.isFrozen.call();
		assert.strictEqual(isFrozen, true, "Contract has not been frozen.");
	});
});