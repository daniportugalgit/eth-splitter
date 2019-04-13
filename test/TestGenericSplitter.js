const truffleAssert = require('truffle-assertions');
const GenericSplitter = artifacts.require("GenericSplitter");

contract("GenericSplitter", accounts => {
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
		let _instance;

		const account4 = accounts[4];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.splitMyMoney(200, account2, account3, {from: account4, value:100}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should REVERT the split when user sends less ETH than amount + balance", () => {
		let _instance;

		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];

		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.splitMyMoney(402, account2, account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should REVERT the split when user sends more ETH than amount", () => {
		let _instance;

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
		let _instance;

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
		let _instance;

		const account1 = accounts[1];
				
		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.withdraw({from: account1}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should let owner pause contract", () => {
		let _instance;

		const account0 = accounts[0];
				
		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return _instance.pause({from: account0});
		})
		.then(() => {
			return _instance.isPaused.call();
		})
		.then(isPaused => {
			assert.equal(isPaused, true, "Contract has not been paused.");
		})
	});

	it("should let owner unpause contract", () => {
		let _instance;

		const account0 = accounts[0];
				
		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return _instance.resume({from: account0});
		})
		.then(() => {
			return _instance.isPaused.call();
		})
		.then(isPaused => {
			assert.equal(isPaused, false, "Contract has not been unpaused.");
		})
	});

	it("should REVERT when owner tries to unpause the contract if not paused", () => {
		let _instance;

		const account0 = accounts[0];
				
		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.resume({from: account0}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should REVERT when not-owner tries to pause contract", () => {
		let _instance;

		const account1 = accounts[1];
				
		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.pause({from: account1}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should REVERT when not-owner tries to unpause a paused contract", () => {
		let _instance;

		const account0 = accounts[0];
		const account1 = accounts[1];
				
		return GenericSplitter.deployed()
		.then(instance => {
			_instance = instance;
			return _instance.pause({from: account0});
		})
		.then(() => {
			return truffleAssert.reverts(_instance.resume({from: account1}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should REVERT the split if contract is paused", () => {
		let _instance;

		const account1 = accounts[1];
		const account2 = accounts[2];
		const account3 = accounts[3];
				
		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.splitMyMoney(100, account2, account3, {from: account1, value:100}), truffleAssert.ErrorType.REVERT);
		})
	});

	it("should REVERT the withdraw if contract is paused", () => {
		let _instance;
		
		const account2 = accounts[2];
						
		return GenericSplitter.deployed()
		.then(instance => {
			return truffleAssert.reverts(instance.withdraw({from: account2}), truffleAssert.ErrorType.REVERT);
		})
	});
});


/*
- Able to change ownership
 > if new owner is not 0;
 > if new owner is not the same as the old owner

- Fail to change ownership
 > If new owner is 0;
 > if new owner is the same as old owner
 > if msg.sender is not the owner

- Should fire event when
 > Split is made
 > Owership transferred
 > Contrat paused
 > Contract unpaused

 - Unable to destroy contract
  > If contract is ready
  > If msg.sender is not the owner 

 - Able to destroy contract
  > if isPaused == true;






####
DONE:
- Fail the split if
 DONE > user sends less ETH than amount and has 0 balance
 DONE > user sends less ETH than amount + balance
 DONE > user sends more ETH than amount
 DONE > msg.sender equals beneficiary1 || beneficiary2
 DONE > beneficiary1 equals 0 or beneficiary2 equals 0
 DONE > beneficiary1 == beneficiary2

DONE - Able to withdraw if has balance
DONE - Revert withdraw if balance == 0

DONE - should let owner pause contract
DONE - should let owner unpause if paused
DONE - should REVERT when owner tries to unpause the contract if not paused
DONE - should REVERT if not-owner tries to pause contract
DONE - should REVERT if not-owner tries to unpause a paused contract
DONE - Fail the split if contract is paused
DONE - Fail the withdraw if contract is paused
*/