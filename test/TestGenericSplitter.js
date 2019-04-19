const truffleAssert = require('truffle-assertions');
const GenericSplitter = artifacts.require("GenericSplitter");

contract("GenericSplitter", accounts => {
	const [account0, account1, account2, account3, account4] = accounts;
	let _instance;

	beforeEach('setup contract for each test', async function () {
        _instance = await GenericSplitter.new({from:account0});
    })

	it("should split correctly when value is even and user sends all the needed ETH", async () => {
		await _instance.splitMyMoney(100, account2, account3, {from: account1, value:100})
		let balance1 = await _instance.balances.call(account1);
		let balance2 = await _instance.balances.call(account2);
		let balance3 = await _instance.balances.call(account3);

		assert.strictEqual(balance1.toString(10), "0", "Account1 does not have the correct amount after split.");
		assert.strictEqual(balance2.toString(10), "50", "Account2 does not have the correct amount after split.");
		assert.strictEqual(balance3.toString(10), "50", "Account3 does not have the correct amount after split.");
	});

	it("should split correctly when value is odd and user sends all the needed ETH", async () => {
		await _instance.splitMyMoney(101, account2, account3, {from: account1, value:101})
		let balance1 = await _instance.balances.call(account1);
		let balance2 = await _instance.balances.call(account2);
		let balance3 = await _instance.balances.call(account3);

		assert.strictEqual(balance1.toString(10), "1", "Account1 does not have the correct amount after split.");
		assert.strictEqual(balance2.toString(10), "50", "Account2 does not have the correct amount after split.");
		assert.strictEqual(balance3.toString(10), "50", "Account3 does not have the correct amount after split.");
	});

	it("should split correctly when value is even and user sends part of the needed ETH", async () => {
		await _instance.splitMyMoney(100, account2, account3, {from: account1, value:100}); //account1 deposits 50 in account2 and 50 in account3
		await _instance.splitMyMoney(100, account1, account3, {from: account2, value:50}); //account2 uses its 50 balance to deposit 50 in account1 and 50 in account3
		let balance1 = await _instance.balances.call(account1);
		let balance2 = await _instance.balances.call(account2);
		let balance3 = await _instance.balances.call(account3);

		assert.strictEqual(balance1.toString(10), "50", "Account1 does not have the correct amount after split.");
		assert.strictEqual(balance2.toString(10), "0", "Account2 does not have the correct amount after split.");
		assert.strictEqual(balance3.toString(10), "100", "Account3 does not have the correct amount after split.");
	});

	it("should split correctly when value is odd and user sends part of the needed ETH", async () => {
		await _instance.splitMyMoney(100, account2, account3, {from: account1, value:100}); //account1 deposits 50 in account2 and 50 in account3
		await _instance.splitMyMoney(101, account1, account3, {from: account2, value:51}); //account2 uses its 50 balance to deposit 50 in account1 and 50 in account3 (and gets 1 back)
		let balance1 = await _instance.balances.call(account1);
		let balance2 = await _instance.balances.call(account2);
		let balance3 = await _instance.balances.call(account3);

		assert.strictEqual(balance1.toString(10), "50", "Account1 does not have the correct amount after split.");
		assert.strictEqual(balance2.toString(10), "1", "Account2 does not have the correct amount after split.");
		assert.strictEqual(balance3.toString(10), "100", "Account3 does not have the correct amount after split.");
	});

	it("should REVERT the split when user sends less ETH than amount and has 0 balance", async () => {
		await truffleAssert.reverts(_instance.splitMyMoney(200, account2, account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT the split when user sends less ETH than amount + balance", async () => {
		await _instance.splitMyMoney(100, account2, account3, {from: account1, value:100}); //account1 deposits 50 in account2 and 50 in account3
		await truffleAssert.reverts(_instance.splitMyMoney(200, account1, account3, {from: account2, value:100}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT the split when user sends more ETH than amount", async () => {
		await truffleAssert.reverts(_instance.splitMyMoney(100, account2, account3, {from: account1, value:101}), truffleAssert.ErrorType.REVERT);
	});

	it("should REVERT the split when msg.sender equals (beneficiary1 || beneficiary2)", async () => {
		await truffleAssert.reverts(_instance.splitMyMoney(100, account1, account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary1 is the same as msg.sender");
		await truffleAssert.reverts(_instance.splitMyMoney(100, account2, account1, {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary2 is the same as msg.sender");
	});

	it("should REVERT the split when beneficiary1 equals 0 or beneficiary2 equals 0", async () => {
		await truffleAssert.reverts(_instance.splitMyMoney(100, "0x0000000000000000000000000000000000000000", account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary1 is address(0)");
		await truffleAssert.reverts(_instance.splitMyMoney(100, account2, "0x0000000000000000000000000000000000000000", {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary2 is address(0)");
	});

	it("should REVERT the split when beneficiary1 == beneficiary2", async () => {
		await truffleAssert.reverts(_instance.splitMyMoney(100, account2, account2, {from: account1, value:100}), truffleAssert.ErrorType.REVERT);
	});

	it("should be able to withdraw if balance > 0, then balance should become 0", async () => {
		await _instance.splitMyMoney(100, account2, account3, {from: account1, value:100}); //account1 deposits 50 in account2 and 50 in account3
		await truffleAssert.passes(_instance.withdraw({from: account2}), "Unable to withdraw even having funds.");
		let balance = await _instance.balances.call(account2);
		assert.strictEqual(balance.toString(10), "0", "After withdraw funds did not go to zero.");
	});

	it("should REVERT the withdraw if balance == 0", async () => {
		await truffleAssert.reverts(_instance.withdraw({from: account1}), truffleAssert.ErrorType.REVERT);
	});

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

	it("should emit event with correct parameters when a Split is made", async () => {
		let result = await _instance.splitMyMoney(100, account2, account3, {from: account1, value:100});
		await truffleAssert.eventEmitted(result, 'MoneySplitted', (ev) => {
			return ev.totalAmount == 100 && ev.from == account1 && ev.beneficiary1 == account2 && ev.beneficiary2 == account3;
		});
	});

	it("should emit event with correct parameters when the ownership is transeferred", async () => {		
		let result = await _instance.transferOwnership(account1, {from: account0});
		await truffleAssert.eventEmitted(result, 'OwnershipTransferred', (ev) => {
		    return ev.from == account0 && ev.to == account1;
		});
	});

	it("should emit event with correct parameters when the contract is paused", async () => {
		let result = await _instance.pause({from: account0});
		await truffleAssert.eventEmitted(result, 'ContractPaused', (ev) => {
		    return ev.pausedBy == account0;
		});
	});

	it("should emit event with correct parameters when the contract is resumed", async () => {
		await _instance.pause({from: account0});
		let result = await _instance.resume({from: account0});
		await truffleAssert.eventEmitted(result, 'ContractResumed', (ev) => {
		    return ev.resumedBy == account0;
		});
	});

	it("should emit event with correct parameters when a whithdrawal happens", async () => {
		await _instance.splitMyMoney(100, account2, account3, {from: account1, value:100}); //account1 deposits 50 in account2 and 50 in account3
		let result = await _instance.withdraw({from: account2});
		await truffleAssert.eventEmitted(result, 'Withdrawal', (ev) => {
		    return ev.amount == 50 && ev.from == account2;
		});
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

	it("should emit event with correct parameters when frozen", async () => {	
		await _instance.pause({from: account0});
		let result = await _instance.freeze({from: account0});
		await truffleAssert.eventEmitted(result, 'ContractFrozen', (ev) => {
		    return ev.frozenBy == account0;
		});
	});

	it("should actually transfer ETH when someone withdraws", async () => {
		let balanceBefore = await web3.eth.getBalance(account4);

		await _instance.splitMyMoney(100, account2, account4, {from: account1, value:100, gasPrice:10}); //account1 deposits 50 in account2 and 50 in account3
		let tx = await _instance.withdraw({from: account4});
		let receipt = tx.receipt;
				
		let gasPrice = await web3.eth.getGasPrice();
		let gasCost = gasPrice * receipt.gasUsed;
		assert.strictEqual("21484", receipt.gasUsed.toString(10), "Gas used is wrong.");
		
		let expected = web3.utils.toBN(balanceBefore).add(web3.utils.toBN(50)).sub(web3.utils.toBN(gasCost));
		let balanceAfter = await web3.eth.getBalance(account4);

		assert.strictEqual(balanceAfter.toString(10), expected.toString(10), "User has not received ETH after withdraw.");
	});

	//Its impossible to freeze the contract unless it is paused,
	//It's impossible to resume it once it is frozen,
	//It's impossible to unfreeze it once it's frozen.
	//Therefore, there's no need to test the split and the withdrawal with the frozen flag;
	//The tests with the paused flag will suffice.
});