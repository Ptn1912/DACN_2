// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CoinToken contract...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy contract with initial supply (1 million coins)
  const CoinToken = await hre.ethers.getContractFactory("CoinToken");
  const coinToken = await CoinToken.deploy(1000000);

  await coinToken.waitForDeployment();
  const contractAddress = await coinToken.getAddress();

  console.log("✅ CoinToken deployed to:", contractAddress);
  console.log("📊 Initial supply: 1,000,000 COIN");
  
  // Save contract address and ABI to file
  const fs = require('fs');
  const contractData = {
    address: contractAddress,
    abi: JSON.parse(coinToken.interface.formatJson()),
    network: hre.network.name,
    deployer: deployer.address
  };
  
  fs.writeFileSync(
    './contract-config.json',
    JSON.stringify(contractData, null, 2)
  );
  
  console.log("💾 Contract config saved to contract-config.json");
  
  // Register some test users
  console.log("\n👥 Registering test users...");
  const accounts = await hre.ethers.getSigners();
  
  for (let i = 1; i <= 5; i++) {
    const tx = await coinToken.registerUserWallet(i, accounts[i].address);
    await tx.wait();
    console.log(`✓ User ${i} registered: ${accounts[i].address}`);
  }
  
  // Mint some coins to test users
  console.log("\n💎 Minting initial coins...");
  for (let i = 1; i <= 5; i++) {
    const tx = await coinToken.mintCoins(accounts[i].address, 100);
    await tx.wait();
    const balance = await coinToken.getUserBalance(i);
    console.log(`✓ User ${i} received 100 COIN (Balance: ${balance})`);
  }
  
  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });