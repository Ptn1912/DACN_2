// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SPayLater contract...");
  
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("📍 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (balance === 0n) {
    console.error("❌ Account has no MATIC. Please fund your account first!");
    console.log("\n🔗 Get free testnet MATIC from:");
    console.log("   - https://faucet.polygon.technology/");
    console.log("   - https://www.alchemy.com/faucets/polygon-amoy");
    process.exit(1);
  }

  // Deploy
  const SPayLater = await hre.ethers.getContractFactory("SPayLater");
  const spaylater = await SPayLater.deploy();
  
  await spaylater.waitForDeployment();
  const address = await spaylater.getAddress();
  
  console.log("✅ SPayLater deployed to:", address);
  console.log("\n📝 Update your .env file:");
  console.log(`SPAYLATER_CONTRACT_ADDRESS=${address}`);
  
  // Verify on Polygonscan (optional)
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("\n⏳ Waiting 30s before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Polygonscan");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });