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

#######

What (part 2)

- Create functions to pause/resume/kill the contract: Those become useful when some major issue happened and you want to stop all operations until you figure out what's happening, or if you no longer need this contract.
- Only the owner of the contract can call those functions to change the state of the contract.
- Add "conditions" to your current functions so that they can be called only when the contract is running (i.e. not paused or killed).
- Add test scenarios for the above.

######

Part 3: unit tests

Usingn async/await! :)