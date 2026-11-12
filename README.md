# BlockTask - A Blockchain Based Task Manager

Tech stack: Solidity 0.8.24, Hardhat, ethers.js v6, HTML/CSS/JS, MetaMask.

## Setup
```bash
npm install --legacy-peer-deps
npx hardhat test            # run the 8 unit tests
npx hardhat node            # terminal 1: local blockchain (keep running)
npx hardhat run scripts/deploy.js --network localhost   # terminal 2: deploy
npx serve frontend          # or: python3 -m http.server 3000 --directory frontend
```
If the compiler download is blocked on your network, prefix commands with `USE_SOLCJS=1`
(for example `USE_SOLCJS=1 npx hardhat test`).

## MetaMask
1. Add network: RPC `http://127.0.0.1:8545`, Chain ID `31337`, currency ETH.
2. Import one or two private keys printed by `npx hardhat node` (test accounts only).
3. Open http://localhost:3000 and click **Connect MetaMask**.

## Features
Create, complete, delete tasks; assign to another wallet; priority and due date; immutable event log.
