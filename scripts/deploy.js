const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const BlockTask = await hre.ethers.getContractFactory("BlockTask");
  const bt = await BlockTask.deploy();
  await bt.waitForDeployment();
  const address = await bt.getAddress();
  console.log("BlockTask deployed to:", address);

  const artifact = await hre.artifacts.readArtifact("BlockTask");
  fs.writeFileSync(
    "frontend/contract.js",
    `window.BLOCKTASK = ${JSON.stringify({ address, abi: artifact.abi }, null, 2)};\n`
  );
  console.log("Wrote frontend/contract.js");
}

main().catch((e) => { console.error(e); process.exit(1); });
