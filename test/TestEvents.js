const truffleAssert = require('truffle-assertions');
const GenericSplitter = artifacts.require("GenericSplitter");

contract("should emit events", accounts => {
	const [account0, account1, account2, account3, account4] = accounts;
	let _instance;

	beforeEach('setup contract for each test', async function () {
        _instance = await GenericSplitter.new({from:account0});
    })

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

	it("should emit event with correct parameters when frozen", async () => {	
		await _instance.pause({from: account0});
		let result = await _instance.freeze({from: account0});
		await truffleAssert.eventEmitted(result, 'ContractFrozen', (ev) => {
		    return ev.frozenBy == account0;
		});
	});
});