const truffleAssert = require('truffle-assertions');
const GenericSplitter = artifacts.require("GenericSplitter");

contract("Ownable", accounts => {
	const [account0, account1, account2, account3, account4] = accounts;
	let _instance;

	beforeEach('setup contract for each test', async function () {
        _instance = await GenericSplitter.new({from:account0});
    })

    it("should allow owner to change ownership to valid address", async () => {
		await _instance.transferOwnership(account1, {from: account0})
		let newOwner = await _instance.getOwner.call();
		assert.strictEqual(newOwner, account1, "Ownership has not changed.");
	});

	it("should REVERT TransferOwnership if new owner is addres(0)", async () => {
		await truffleAssert.reverts(_instance.transferOwnership("0x0000000000000000000000000000000000000000", {from: account0}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT TransferOwnership if new owner is the same as old owner", async () => {
		await truffleAssert.reverts(_instance.transferOwnership(account0, {from: account0}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT TransferOwnership if msg.sender is not the owner", async () => {
		await truffleAssert.reverts(_instance.transferOwnership(account1, {from: account2}), truffleAssert.ErrorType.REVERT);
	});
});

