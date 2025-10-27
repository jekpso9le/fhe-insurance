const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Pre-deployment checks for FHE Insurance Platform
 */
async function main() {
  console.log("🔍 Running Pre-Deployment Checks...\n");

  let hasErrors = false;
  const checks = [];

  // ═══════════════════════════════════════════════════════════════
  // Check 1: Environment Variables
  // ═══════════════════════════════════════════════════════════════
  console.log("📋 [1/5] Checking Environment Variables");
  console.log("─".repeat(50));

  if (!process.env.PRIVATE_KEY) {
    console.log("❌ PRIVATE_KEY not set in .env");
    hasErrors = true;
  } else {
    console.log("✅ PRIVATE_KEY configured");
  }

  if (!process.env.SEPOLIA_RPC_URL) {
    console.log("❌ SEPOLIA_RPC_URL not set in .env");
    hasErrors = true;
  } else {
    console.log("✅ SEPOLIA_RPC_URL configured:", process.env.SEPOLIA_RPC_URL);
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Check 2: Network Connection
  // ═══════════════════════════════════════════════════════════════
  console.log("📋 [2/5] Checking Network Connection");
  console.log("─".repeat(50));

  try {
    const network = await hre.ethers.provider.getNetwork();
    console.log("✅ Connected to network:", network.name);
    console.log("   Chain ID:", network.chainId.toString());

    if (network.chainId.toString() !== "11155111") {
      console.log("⚠️  WARNING: Not connected to Sepolia (expected chain ID: 11155111)");
    }
  } catch (error) {
    console.log("❌ Network connection failed:", error.message);
    hasErrors = true;
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Check 3: Deployer Account
  // ═══════════════════════════════════════════════════════════════
  console.log("📋 [3/5] Checking Deployer Account");
  console.log("─".repeat(50));

  try {
    const deployer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, hre.ethers.provider);
    console.log("✅ Deployer address:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceInEth = hre.ethers.formatEther(balance);
    console.log("💰 Balance:", balanceInEth, "ETH");

    const minBalance = 0.05;
    if (parseFloat(balanceInEth) < minBalance) {
      console.log(`❌ Insufficient balance! Need at least ${minBalance} ETH`);
      console.log("💡 Get Sepolia ETH from:");
      console.log("   - https://sepoliafaucet.com");
      console.log("   - https://sepolia-faucet.pk910.de");
      hasErrors = true;
    } else {
      console.log("✅ Sufficient balance for deployment");
    }
  } catch (error) {
    console.log("❌ Deployer account check failed:", error.message);
    hasErrors = true;
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Check 4: Contracts Compilation
  // ═══════════════════════════════════════════════════════════════
  console.log("📋 [4/5] Checking Contracts Compilation");
  console.log("─".repeat(50));

  const requiredContracts = [
    "PolicyRegistry",
    "ClaimsManager",
    "RiskAssessment"
  ];

  for (const contractName of requiredContracts) {
    try {
      await hre.ethers.getContractFactory(contractName);
      console.log(`✅ ${contractName} compiled successfully`);
    } catch (error) {
      console.log(`❌ ${contractName} compilation check failed:`, error.message);
      hasErrors = true;
    }
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Check 5: Directory Structure
  // ═══════════════════════════════════════════════════════════════
  console.log("📋 [5/5] Checking Directory Structure");
  console.log("─".repeat(50));

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    console.log("📁 Creating deployments directory...");
    fs.mkdirSync(deploymentsDir, { recursive: true });
    console.log("✅ Deployments directory created");
  } else {
    console.log("✅ Deployments directory exists");
  }

  const frontendDir = path.join(__dirname, "../../frontend");
  if (!fs.existsSync(frontendDir)) {
    console.log("⚠️  Warning: Frontend directory not found");
  } else {
    console.log("✅ Frontend directory exists");
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════
  console.log("═".repeat(50));
  if (hasErrors) {
    console.log("❌ PRE-DEPLOYMENT CHECKS FAILED");
    console.log("═".repeat(50));
    console.log("\nPlease fix the errors above before deploying.\n");
    process.exit(1);
  } else {
    console.log("✅ ALL PRE-DEPLOYMENT CHECKS PASSED!");
    console.log("═".repeat(50));
    console.log("\n🚀 Ready to deploy! Run:");
    console.log("   npx hardhat run scripts/deploy-insurance.js --network sepolia\n");
    process.exit(0);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Pre-deployment check error:");
    console.error(error);
    process.exit(1);
  });
