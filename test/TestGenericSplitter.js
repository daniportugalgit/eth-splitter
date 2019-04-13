const truffleAssert = require('truffle-assertions');
const GenericSplitter = artifacts.require("GenericSplitter");

contract("GenericSplitter", accounts => {
	//Sequential tests with the same deployed instance (because users may use their local balances to split):
	it("should start with zeroed balances in all accounts", () => {
		let _instance;

		const account0 = accounts[0];
		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];
		const account4 = accounts[4];

		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return _instance.balances.call(account0);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 0, "Account0 started with money!");
			return _instance.balances.call(account1);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 0, "Account1 started with money!");
			return _instance.balances.call(account2);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 0, "Account2 started with money!");
			return _instance.balances.call(account3);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 0, "Account3 started with money!");
			return _instance.balances.call(account4);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 0, "Account4 started with money!");
		})
	});

	it("should split correctly when value is even and user sends all the needed ETH", () => {
		let _instance;

		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return _instance.splitMyMoney(100, account2, account3, {from: account1, value:100});
		})
		.then(() => {
			return _instance.balances.call(account2);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 50, "Account2 does not have the correct amount after split.");
			return _instance.balances.call(account3);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 50, "Account3 does not have the correct amount after split.");
			return _instance.balances.call(account1);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 0, "Account1 does not have the correct amount after split.");
		})
	});

	it("should split correctly when value is odd and user sends all the needed ETH", () => {
		let _instance;

		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return _instance.splitMyMoney(101, account2, account3, {from: account1, value:101});
		})
		.then(() => {
			return _instance.balances.call(account2);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 100, "Account2 does not have the correct amount after split.");
			return _instance.balances.call(account3);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 100, "Account3 does not have the correct amount after split.");
			return _instance.balances.call(account1);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 1, "Account1 does not have the correct amount after split.");
		})
	});

	it("should split correctly when value is even and user sends part of the needed ETH", () => {
		let _instance;

		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return _instance.splitMyMoney(200, account1, account3, {from: account2, value:100});
		})
		.then(() => {
			return _instance.balances.call(account2);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 0, "Account2 does not have the correct amount after split.");
			return _instance.balances.call(account3);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 200, "Account3 does not have the correct amount after split.");
			return _instance.balances.call(account1);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 101, "Account1 does not have the correct amount after split.");
		})
	});

	it("should split correctly when value is odd and user sends part of the needed ETH", () => {
		let _instance;

		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return _instance.splitMyMoney(401, account1, account2, {from: account3, value:201});
		})
		.then(() => {
			return _instance.balances.call(account2);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 200, "Account2 does not have the correct amount after split.");
			return _instance.balances.call(account3);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 1, "Account3 does not have the correct amount after split.");
			return _instance.balances.call(account1);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 301, "Account1 does not have the correct amount after split.");
		})
	});

	it("should REVERT the split when user sends less ETH than amount and has 0 balance", () => {
		const account4 = accounts[4];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.splitMyMoney(200, account2, account3, {from: account4, value:100}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should REVERT the split when user sends less ETH than amount + balance", () => {
		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.splitMyMoney(402, account2, account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should REVERT the split when user sends more ETH than amount", () => {
		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.splitMyMoney(100, account2, account3, {from: account1, value:101}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should REVERT the split when msg.sender equals (beneficiary1 || beneficiary2)", () => {
		let _instance;

		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return truffleAssert.reverts(_instance.splitMyMoney(100, account1, account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary1 is the same as msg.sender");
		})
		.then(() => {
			return truffleAssert.reverts(_instance.splitMyMoney(100, account2, account1, {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary2 is the same as msg.sender");
		})
	});

	it("should REVERT the split when beneficiary1 equals 0 or beneficiary2 equals 0", () => {
		let _instance;

		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return truffleAssert.reverts(_instance.splitMyMoney(100, "0x0000000000000000000000000000000000000000", account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary1 is address(0)");
		})
		.then(() => {
			return truffleAssert.reverts(_instance.splitMyMoney(100, account2, "0x0000000000000000000000000000000000000000", {from: account1, value:100}), truffleAssert.ErrorType.REVERT, "Beneficiary2 is address(0)");
		})
	});

	it("should REVERT the split when beneficiary1 == beneficiary2", () => {
		const account1 = accounts[1];
		const account2 = accounts[2];
		
		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.splitMyMoney(100, account2, account2, {from: account1, value:100}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should be able to withdraw if balance > 0, then balance should become 0", () => {
		let _instance;

		const account1 = accounts[1];
				
		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return _instance.withdraw({from: account1});
		})
		.then(() => {
			return _instance.balances.call(account1);
		})
		.then(balance => {
			assert.equal(balance.toNumber(), 0, "Unable to withdraw even hhaving funds.");
		})
	});

	it("should REVERT the withdraw if balance == 0", () => {
		const account1 = accounts[1];
				
		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.withdraw({from: account1}), truffleAssert.ErrorType.REVERT);
		})
	});

	//Redeploys contract for isolated tests:
	it("should let owner pause contract", async () => {
		const _instance = await GenericSplitter.new();
		
		const account0 = accounts[0];
				
		return _instance.pause({from: account0})
		.then(() => {
			return _instance.isPaused.call();
		})
		.then(isPaused => {
			assert.equal(isPaused, true, "Contract has not been paused.");
		})
	});

	//Redeploys contract for isolated tests:
	it("should let owner resume a paused contract", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];
		
		return _instance.pause({from: account0})
		.then(() => {
			return _instance.resume({from: account0})
		})
		.then(() => {
			return _instance.isPaused.call();
		})
		.then(isPaused => {
			assert.equal(isPaused, false, "Contract has not been resumed.");
		})
	});

	//Redeploys contract for isolated tests:
	it("should REVERT when owner tries to resume the contract if not paused", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];
				
		await truffleAssert.reverts(_instance.resume({from: account0}), truffleAssert.ErrorType.REVERT);
	});

	//Redeploys contract for isolated tests:
	it("should REVERT when not-owner tries to pause contract", async () => {
		const _instance = await GenericSplitter.new();

		const account1 = accounts[1];
				
		await truffleAssert.reverts(_instance.pause({from: account1}), truffleAssert.ErrorType.REVERT);
	});

	//Redeploys contract for isolated tests:
	it("should REVERT when not-owner tries to resume a paused contract", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];
		const account1 = accounts[1];
				
		return _instance.pause({from: account0})
		.then(() => {
			return truffleAssert.reverts(_instance.resume({from: account1}), truffleAssert.ErrorType.REVERT);
		})
	});

	//Redeploys contract for isolated tests:
	it("should REVERT the split if contract is paused", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];
		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];
				
		return _instance.pause({from: account0})
		.then(() => {
			return truffleAssert.reverts(_instance.splitMyMoney(100, account2, account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT);
		})
	});

	//Redeploys contract for isolated tests:
	it("should REVERT the withdraw if contract is paused", async () => {
		const _instance = await GenericSplitter.new();
		
		const account0 = accounts[0];
		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];
		
		return _instance.splitMyMoney(100, account2, account3, {from: account1, value:100})
		.then(() => {	
			return _instance.pause({from: account0});
		})
		.then(() => {
			return truffleAssert.reverts(_instance.withdraw({from: account2}), truffleAssert.ErrorType.REVERT);
		})
	});
	
	//Redeploys contract for isolated tests:
	it("should allow owner to change ownership to valid address", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];
		const account1 = accounts[1];

		return _instance.transferOwnership(account1, {from: account0})
		.then(() => {
			return _instance.owner.call();
		})
		.then((newOwner) => {
			assert.equal(newOwner, account1, "Ownership has not changed.");
		})
	});

	//Redeploys contract for isolated tests:
	it("should REVERT TransferOwnership if new owner is addres(0)", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];

		await truffleAssert.reverts(_instance.transferOwnership("0x0000000000000000000000000000000000000000", {from: account0}), truffleAssert.ErrorType.REVERT);
	});

	//Redeploys contract for isolated tests:
	it("should REVERT TransferOwnership if new owner is the same as old owner", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];

		await truffleAssert.reverts(_instance.transferOwnership(account0, {from: account0}), truffleAssert.ErrorType.REVERT);
	});

	//Redeploys contract for isolated tests:
	it("should REVERT TransferOwnership if msg.sender is not the owner", async () => {
		const _instance = await GenericSplitter.new();

		const account1 = accounts[1];
		const account2 = accounts[2];

		await truffleAssert.reverts(_instance.transferOwnership(account1, {from: account2}), truffleAssert.ErrorType.REVERT);
	});

	//Redeploys contract for isolated tests:
	it("should emit event with correct parameters when a Split is made", async () => {
		const _instance = await GenericSplitter.new();

		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return _instance.splitMyMoney(100, account2, account3, {from: account1, value:100})
		.then(result => {
			truffleAssert.eventEmitted(result, 'MoneySplitted', (ev) => {
			    return ev.totalAmount == 100 && ev.from == account1 && ev.beneficiary1 == account2 && ev.beneficiary2 == account3;
			});
		})
	});

	//Redeploys contract for isolated tests:
	it("should emit event with correct parameters when the ownership is transeferred", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];
		const account1 = accounts[1];
		
		return _instance.transferOwnership(account1, {from: account0})
		.then(result => {
			truffleAssert.eventEmitted(result, 'OwnershipTransferred', (ev) => {
			    return ev.newOwner == account1;
			});
		})
	});

	//Redeploys contract for isolated tests:
	it("should emit event with correct parameters when the contract is paused", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];

		return _instance.pause({from: account0})
		.then(result => {
			truffleAssert.eventEmitted(result, 'ContractPaused', (ev) => {
			    return ev.pausedBy == account0;
			});
		})
	});

	//Redeploys contract for isolated tests:
	it("should emit event with correct parameters when the contract is resumed", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];

		return _instance.pause({from: account0})
		.then(() => {
			return _instance.resume({from: account0});
		})
		.then(result => {
			truffleAssert.eventEmitted(result, 'ContractResumed', (ev) => {
			    return ev.resumedBy == account0;
			});
		})
	});

	//Redeploys contract for isolated tests:
	it("should REVERT killContract if contract is not paused", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];
		
		await truffleAssert.reverts(_instance.killContract({from: account0}), truffleAssert.ErrorType.REVERT);
	});

	//Redeploys contract for isolated tests:
	it("should REVERT killContract if paused && msg.sender is not the owner", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];
		const account1 = accounts[1];
		
		return _instance.pause({from: account0})
		.then(() => {
			return truffleAssert.reverts(_instance.killContract({from: account1}), truffleAssert.ErrorType.REVERT);
		})
	});

	//Redeploys contract for isolated tests:
	it("should destroy contract if paused && msg.sender == owner", async () => {
		const _instance = await GenericSplitter.new();

		const account0 = accounts[0];
				
		return _instance.pause({from: account0})
		.then(() => {
			return _instance.killContract({from: account0});
		})
		.then(result => {
			truffleAssert.eventEmitted(result, 'ContractDestroyed', (ev) => {
			    return ev.destroyedBy == account0;
			});
		})
	});
});