# FHE Insurance Platform - Deployment Guide

## 📋 Prerequisites

- Node.js v18+ and npm installed
- Sepolia testnet ETH (at least 0.05 ETH)
- `.env` file configured with your private key

## 🔑 Environment Setup

1. **Copy `.env.example` to `.env`** (if not already done):
   ```bash
   cp .env.example .env
   ```

2. **Configure `.env`**:
   ```env
   SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   PRIVATE_KEY=0xyour_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

3. **Get Sepolia Test ETH**:
   - Alchemy Faucet: https://sepoliafaucet.com
   - PoW Faucet: https://sepolia-faucet.pk910.de
   - Infura Faucet: https://www.infura.io/faucet/sepolia

## 🚀 Quick Deployment

### Option 1: One-Command Deploy (Recommended)

```bash
# Runs pre-deployment checks + deployment
npm run deploy
```

This will:
1. ✅ Verify environment variables
2. ✅ Check network connection
3. ✅ Verify deployer account balance
4. ✅ Confirm contracts compiled
5. 🚀 Deploy all contracts to Sepolia
6. 📝 Generate frontend `.env` file
7. 💾 Save deployment info

### Option 2: Step-by-Step Deploy

```bash
# 1. Pre-deployment checks
npm run precheck

# 2. Deploy to Sepolia
npm run deploy:sepolia
```

### Option 3: Local Development Deploy

```bash
# Start local Hardhat node (in separate terminal)
npx hardhat node

# Deploy to local node
npm run deploy:local
```

## 📦 Deployed Contracts

After successful deployment, you'll get:

### Contract Addresses
- **PolicyRegistry**: `0x...`
- **ClaimsManager**: `0x...`
- **RiskAssessment**: `0x...`

### Files Generated
- `deployments/latest.json` - Latest deployment info
- `deployments/sepolia-{timestamp}.json` - Timestamped deployment record
- `../frontend/.env` - Frontend environment file (auto-generated)

## 🔍 Verify Deployment

### View on Etherscan
```
https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}
```

### Verify Contract Source Code (Optional)
```bash
# Verify PolicyRegistry
npx hardhat verify --network sepolia {POLICY_REGISTRY_ADDRESS}

# Verify ClaimsManager
npx hardhat verify --network sepolia {CLAIMS_MANAGER_ADDRESS}

# Verify RiskAssessment
npx hardhat verify --network sepolia {RISK_ASSESSMENT_ADDRESS}
```

## 🧪 Test Deployment

### Run Local Tests
```bash
npm test
```

### Interact with Deployed Contracts
```bash
npx hardhat console --network sepolia
```

Example interactions:
```javascript
const PolicyRegistry = await ethers.getContractAt("PolicyRegistry", "0x...");
const count = await PolicyRegistry.policyCounter();
console.log("Total policies:", count.toString());
```

## 🎭 Frontend Integration

After deployment, the frontend `.env` is automatically generated:

```bash
cd ../frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:5173

## 📊 Deployment Checklist

- [ ] `.env` file configured
- [ ] Deployer account has Sepolia ETH (>0.05 ETH)
- [ ] Contracts compiled successfully
- [ ] Pre-deployment checks passed
- [ ] Deployment transaction confirmed
- [ ] Contract addresses saved
- [ ] Frontend `.env` updated
- [ ] Verified on Etherscan (optional)
- [ ] Frontend tested with deployed contracts

## 🛠️ Troubleshooting

### Issue: "Insufficient balance"
**Solution**: Get more Sepolia ETH from faucets listed above

### Issue: "Network not connected"
**Solution**: Check `SEPOLIA_RPC_URL` in `.env` and internet connection

### Issue: "Private key error"
**Solution**: Ensure `PRIVATE_KEY` in `.env` has `0x` prefix

### Issue: "Contract compilation failed"
**Solution**: Run `npm run compile` to see detailed errors

### Issue: "Gas estimation failed"
**Solution**: Check deployer account has ETH and network is accessible

## 📝 Gas Costs (Estimated)

Based on current Sepolia gas prices:

| Contract | Gas Used | Estimated Cost (at 1 gwei) |
|----------|----------|---------------------------|
| PolicyRegistry | ~2,500,000 | ~0.0025 ETH |
| ClaimsManager | ~3,000,000 | ~0.003 ETH |
| RiskAssessment | ~2,000,000 | ~0.002 ETH |
| **Total** | **~7,500,000** | **~0.0075 ETH** |

*Note: Actual costs may vary based on network conditions*

## 🔒 Security Notes

- ⚠️ **NEVER** commit `.env` file to version control
- ⚠️ Use test private keys only for Sepolia deployment
- ⚠️ For mainnet, use hardware wallet or secure key management
- ⚠️ Double-check contract addresses before frontend integration

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review Hardhat logs for detailed error messages
3. Verify all prerequisites are met
4. Check Sepolia network status

## 🎉 Success!

Once deployed, you can:
- Create privacy-preserving insurance policies
- Submit encrypted claims
- Create risk assessment profiles
- All with FHE encryption protecting sensitive data

Happy deploying! 🚀
