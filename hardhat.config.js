require("@nomicfoundation/hardhat-toolbox");
const path = require("path");

// Optional: compile with the bundled solcjs instead of downloading solc
// (useful on machines without internet). Run with:  USE_SOLCJS=1 npx hardhat test
if (process.env.USE_SOLCJS) {
  const { subtask } = require("hardhat/config");
  const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");
  subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
    if (args.solcVersion === "0.8.24") {
      const compilerPath = path.join(__dirname, "node_modules", "solc", "soljson.js");
      return { compilerPath, isSolcJs: true, version: args.solcVersion, longVersion: "0.8.24+commit.e11b9ed9" };
    }
    return runSuper();
  });
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: { url: "http://127.0.0.1:8545" },
  },
};
