// scripts/deploy.js (hoặc deploy.ts)
const hre = require("hardhat");

async function main() {
  const initialSupply = 1000; // ví dụ
  const CoinToken = await hre.ethers.getContractFactory("CoinToken");
  const coinToken = await CoinToken.deploy(initialSupply);

  console.log("CoinToken deployed to:", await coinToken.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});