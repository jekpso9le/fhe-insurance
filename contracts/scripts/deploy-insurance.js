const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy FHE Insurance Platform contracts
 */
async function main() {
  console.log("🚀 Deploying FHE Insurance Platform to Sepolia...\n");

  const deployer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, hre.ethers.provider);
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  const deployedContracts = {};

  // ═══════════════════════════════════════════════════════════════
  // 1. Deploy PolicyRegistry
  // ═══════════════════════════════════════════════════════════════
  console.log("📦 [1/3] Deploying PolicyRegistry...");
  console.log("═".repeat(50));

  const PolicyRegistry = await hre.ethers.getContractFactory("PolicyRegistry", deployer);
  const policyRegistry = await PolicyRegistry.deploy();
  await policyRegistry.waitForDeployment();
  const policyRegistryAddress = await policyRegistry.getAddress();

  console.log("✅ PolicyRegistry deployed to:", policyRegistryAddress);
  deployedContracts.policyRegistry = policyRegistryAddress;

  console.log("   ⏳ Waiting for 2 confirmations...");
  await policyRegistry.deploymentTransaction().wait(2);
  console.log("   ✅ Confirmed\n");

  // ═══════════════════════════════════════════════════════════════
  // 2. Deploy ClaimsManager
  // ═══════════════════════════════════════════════════════════════
  console.log("📦 [2/3] Deploying ClaimsManager...");
  console.log("═".repeat(50));

  const ClaimsManager = await hre.ethers.getContractFactory("ClaimsManager", deployer);
  const claimsManager = await ClaimsManager.deploy();
  await claimsManager.waitForDeployment();
  const claimsManagerAddress = await claimsManager.getAddress();

  console.log("✅ ClaimsManager deployed to:", claimsManagerAddress);
  deployedContracts.claimsManager = claimsManagerAddress;

  console.log("   ⏳ Waiting for 2 confirmations...");
  await claimsManager.deploymentTransaction().wait(2);
  console.log("   ✅ Confirmed\n");

  // Configure ClaimsManager to reference PolicyRegistry
  console.log("   🔧 Configuring ClaimsManager...");
  const tx = await claimsManager.setPolicyRegistry(policyRegistryAddress);
  await tx.wait();
  console.log("   ✅ PolicyRegistry linked to ClaimsManager\n");

  // ═══════════════════════════════════════════════════════════════
  // 3. Deploy RiskAssessment
  // ═══════════════════════════════════════════════════════════════
  console.log("📦 [3/3] Deploying RiskAssessment...");
  console.log("═".repeat(50));

  const RiskAssessment = await hre.ethers.getContractFactory("RiskAssessment", deployer);
  const riskAssessment = await RiskAssessment.deploy();
  await riskAssessment.waitForDeployment();
  const riskAssessmentAddress = await riskAssessment.getAddress();

  console.log("✅ RiskAssessment deployed to:", riskAssessmentAddress);
  deployedContracts.riskAssessment = riskAssessmentAddress;

  console.log("   ⏳ Waiting for 2 confirmations...");
  await riskAssessment.deploymentTransaction().wait(2);
  console.log("   ✅ Confirmed\n");

  // ═══════════════════════════════════════════════════════════════
  // Save Deployment Information
  // ═══════════════════════════════════════════════════════════════
  console.log("💾 Saving deployment information...");

  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PolicyRegistry: deployedContracts.policyRegistry,
      ClaimsManager: deployedContracts.claimsManager,
      RiskAssessment: deployedContracts.riskAssessment,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const deploymentFile = path.join(deploymentsDir, `sepolia-${timestamp}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  const latestFile = path.join(deploymentsDir, "latest.json");
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("✅ Deployment info saved\n");

  // ═══════════════════════════════════════════════════════════════
  // Generate Frontend .env
  // ═══════════════════════════════════════════════════════════════
  console.log("📝 Generating frontend .env...");

  const frontendEnv = `# Auto-generated from deployment on ${new Date().toISOString()}
# Contract Addresses (Sepolia Testnet)
VITE_POLICY_REGISTRY_ADDRESS=${deployedContracts.policyRegistry}
VITE_CLAIMS_MANAGER_ADDRESS=${deployedContracts.claimsManager}
VITE_RISK_ASSESSMENT_ADDRESS=${deployedContracts.riskAssessment}

# Network Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_GATEWAY_URL=https://gateway.sepolia.zama.ai
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
`;

  const frontendEnvFile = path.join(__dirname, "../../frontend/.env");
  fs.writeFileSync(frontendEnvFile, frontendEnv);
  console.log("✅ Frontend .env created\n");

  // ═══════════════════════════════════════════════════════════════
  // Deployment Summary
  // ═══════════════════════════════════════════════════════════════
  console.log("═".repeat(70));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("═".repeat(70));
  console.log("\n📋 Deployed Contracts:");
  console.log("─".repeat(70));
  console.log("PolicyRegistry:   ", deployedContracts.policyRegistry);
  console.log("ClaimsManager:    ", deployedContracts.claimsManager);
  console.log("RiskAssessment:   ", deployedContracts.riskAssessment);
  console.log("─".repeat(70));

  console.log("\n🔗 View on Sepolia Etherscan:");
  console.log("PolicyRegistry: ", `https://sepolia.etherscan.io/address/${deployedContracts.policyRegistry}`);
  console.log("ClaimsManager:  ", `https://sepolia.etherscan.io/address/${deployedContracts.claimsManager}`);
  console.log("RiskAssessment: ", `https://sepolia.etherscan.io/address/${deployedContracts.riskAssessment}`);

  console.log("\n📝 Next Steps:");
  console.log("─".repeat(70));
  console.log("1. ✅ Frontend .env updated with contract addresses");
  console.log("2. 🚀 Start frontend: cd ../frontend && npm run dev");
  console.log("3. 🔗 Connect wallet to Sepolia");
  console.log("4. 🎭 Create policies and submit claims!");
  console.log("─".repeat(70));
  console.log("\n✨ Deployment successful! ✨\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
