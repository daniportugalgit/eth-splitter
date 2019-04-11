# eth-splitter
Exercise: split your eth between two beneficiaries.

What

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

Solution:

I've create two contracts. The first one is called StrictSplitter and it does exactly what the briefing says. The are ONLY 3 people. "Alice" is not a generic person, it is actually a specific person called Alice. She is the owner of the contract and only she can send ETH and split her money. Bob and Carol must be registered beforehand. Thus, the system works in a very strict sense.

The second contract is called GenericSplitter and does what I understand it should do: it allows any given 3 people to use the contract in an on-demand basis, meaning that each time person A ("Alice") wants to split her money between two other people, she can. She passes the addresses of the two beneficiaries and sends ETH. The system stores balances for every beneficiary and allows them to withdraw funds. In this manner, today I may be a "Bob" (a beneficiary), but tomorrow I might want to split my money, effectively being an "Alice" (someone who sends ETH to be splitted).

The web page has not been created, but the desired information could be easily fetched from the blockchain as follows:
- "We can see the balance of the Splitter contract on the Web page" => there's a public view function called totalBalance().
- "We can see the balances of Alice, Bob and Carol on the Web page" => There's a public mapping called balances.
- "Alice can use the Web page to split her ether" => There's a public payable function called splitMyMoney().

I also added a function for the user to be able to spend her balance, instead of sending new ETH every single time. It's called splitMyLocalBalance().