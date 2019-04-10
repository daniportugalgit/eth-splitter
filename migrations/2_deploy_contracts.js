var GenericSplitter = artifacts.require("GenericSplitter");
//var StrictSplitter = artifacts.require("StrictSplitter");

module.exports = function(deployer) {
	deployer.deploy(GenericSplitter);
	//deployer.deploy(StrictSplitter);
};
