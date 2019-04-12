# eth-splitter
Exercise: split your eth between two beneficiaries.

What (part 1)

You will create a smart contract named Splitter whereby:

- there are 3 people: Alice, Bob and Carol.
- we can see the balance of the Splitter contract on the Web page.
- whenever Alice sends ether to the contract for it to be split, half of it goes to Bob and the other half to Carol.
- we can see the balances of Alice, Bob and Carol on the Web page.
- Alice can use the Web page to split her ether.

That's it! This is where you put hand to keyboard.

We purposely left a lot to be decided. Such description approximates how your human project sponsors would describe the rules. As the Ethereum Smart Contract specialist, you have to think things through.

OBS:
1) Add unit tests.
2) You can leave the creation of the Web page to after you have been through the next module. Although, of course you can create one now. So when we mention "Web page" it is to give you an idea of the desired result.

########

Solution (part 1):

I've create two contracts. The first one is called StrictSplitter and it does exactly what the briefing says. The are ONLY 3 people. "Alice" is not a generic person, it is actually a specific person called Alice. She is the owner of the contract and only she can send ETH and split her money. Bob and Carol must be registered beforehand. Thus, the system works in a very strict sense.

The second contract is called GenericSplitter and does what I understand it should do: it allows any given 3 people to use the contract in an on-demand basis, meaning that each time person A ("Alice") wants to split her money between two other people, she can. She passes the addresses of the two beneficiaries and sends ETH. The system stores balances for every beneficiary and allows them to withdraw funds. In this manner, today I may be a "Bob" (a beneficiary), but tomorrow I might want to split my money, effectively being an "Alice" (someone who sends ETH to be splitted).
Also, in GenericSplitter it's possible to send less ETH than you mean to split, as long as you have enough local balance to complete the transaction.

The web page has not been created, but the desired information could be easily fetched from the blockchain as follows:
- "We can see the balance of the Splitter contract on the Web page" => There's a native web3 function that does just that.
- "We can see the balances of Alice, Bob and Carol on the Web page" => There's a public mapping called balances.
- "Alice can use the Web page to split her ether" => There's a public payable function called splitMyMoney().

PS: Right now, unit tests are not implemented. They will be in the next iteraction, I hope.

#######

What (part 2)

- Create functions to pause/resume/kill the contract: Those become useful when some major issue happened and you want to stop all operations until you figure out what's happening, or if you no longer need this contract.
- Only the owner of the contract can call those functions to change the state of the contract.
- Add "conditions" to your current functions so that they can be called only when the contract is running (i.e. not paused or killed).
- Add test scenarios for the above.

######

Solution (part 2):

Two new contracts have been developed. The first one implements the classic Ownable pattern. The second is for pausing/resuming the contract.
The Pausable contract also includes two levels of pausing: soft and hard. The hard mode uses the word "FROZEN" instead of "paused" and prevents users even from withdrawing funds. The "paused" state disallows splitting ether, but still allows withdrawals.

The selfdestruct function can only be executed if the contract is frozen. Since it will transfer all funds to the owner, it is recommended that the contrat is first paused, then the users should be notified and given some time to perform withdrawals. Only then should the contract be frozen and, finally, destroyed.

Unit tests still have not been implemented.