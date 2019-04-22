const BigNumber = require('bignumber.js');
BigNumber.config({ DECIMAL_PLACES: 18 });
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_CEIL });

App = {
  web3Provider: null,
  contracts: {},
  instance: null,
  account: '0x0',
  liveAddress: "0x0Dc65a09865d4a239907E34691Bc9037eBBF954f",
  currentAccount: null,
  accountConnectInterval: null,
  devSnippet: "deployed()", //for local tests;
  hostedSnippet: "at(App.liveAddress)", //for hosted contract;
  contractSnippet: "",
  isDev: false,

  init: function() {
    App.isDev ? App.contractSnippet = App.devSnippet : App.contractSnippet = App.hostedSnippet;
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();  
  },

  initContract: function() {
    $.getJSON("./abi/GenericSplitter.json", function(myContractABI) {
      App.contracts.Main = TruffleContract(myContractABI);
      App.contracts.Main.setProvider(App.web3Provider);

      web3.version.getNetwork(function(err,res){console.log("Current network ID: " + res)});

      return App.render();
    });
  },

  metamaskConnect: function() {
    App.web3Provider.enable();
    App.currentAccount = web3.eth.accounts[0];
    App.accountConnectInterval = setInterval(function() {
      if (web3.eth.accounts[0] !== App.currentAccount) {
        App.currentAccount = web3.eth.accounts[0];
        clearInterval(App.accountConnectInterval);
        App.render();
      }
    }, 100);
  },

  render: async function() {
    var myContractInstance;
    var loader = $("#loader");
    var content = $("#content");
    var connect = $("#connect");
    
    loader.show();
    content.hide();
    connect.hide();
    
    App.setUserStillConnected();

    App.instance = await eval("App.contracts.Main." + App.contractSnippet);

    loader.hide();
    content.show();
  },

  setUserStillConnected: function() {
    window.web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        if(App.account != null) {
          $("#accountAddress").html("<hr>Your address is: " + account + "<hr>");
        } else {
          $("#accountAddress").html("<hr><p style=\"color:red;\">Please connect to Metamask to play:</p>");
          $("#connect").show();
          $("#content").hide();
        }
      }
    });
  },

  splitMyMoney: async function() {
    await App.setUserStillConnected();

    let ethToSend = document.getElementById("ethToSend").value;
    let valToSplit = document.getElementById("moneyToSplit").value;
    let beneficiary1 = document.getElementById("beneficiary1").value;
    let beneficiary2 = document.getElementById("beneficiary2").value;

    App.instance.splitMyMoney.sendTransaction(valToSplit, beneficiary1, beneficiary2, { from: App.account, value: ethToSend }).then(function(result) {
        alert("Your transaction has been sent to the Ethereum network. It will take a bit for it to be registered. Please be patient.");
      }).catch(function(err) {
        alert("ERROR: " + err);
    });
  },

  withdraw: async function() {
    App.setUserStillConnected();

    App.instance.withdraw({ from: App.account }).then(function(result) {
      alert("Withdraw successful! You'll receive your money shortly.");
    }).catch(function(err) {
      alert("ERROR: " + err);
    });
  },

  getBalanceOf: async function() {
    App.setUserStillConnected();

    let address = document.getElementById("addressToCheck").value;
    let balance = await App.instance.balances.call(address);
    $("#userBalance").html("Balance: " + balance.toString(10));
  },

  updateMoneyToSplit: function() {
    let ethToSend = document.getElementById('ethToSend').value;
    document.getElementById('moneyToSplit').value = ethToSend;
  }
}


$(function() {
  $(window).load(function() {
    App.init();
  });
});
