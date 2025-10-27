# 🚀 FHE Insurance Platform - Quick Start

## ⚡ 1-Minute Setup

### Deploy Contracts
```bash
cd contracts
npm run deploy
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📋 What You Need

1. **Sepolia ETH** (0.05+ ETH)
   - Get from: https://sepoliafaucet.com

2. **Environment Files**
   - `contracts/.env` - Your private key
   - `frontend/.env` - Auto-generated after deployment

## 🎯 Quick Commands

| Task | Command |
|------|---------|
| **Pre-check** | `npm run precheck` |
| **Deploy** | `npm run deploy` |
| **Test** | `npm test` |
| **Start Frontend** | `cd ../frontend && npm run dev` |

## 📂 Project Structure

```
fhe-insurance/
├── contracts/           # Smart contracts
│   ├── src/
│   │   ├── policies/   # PolicyRegistry.sol
│   │   ├── claims/     # ClaimsManager.sol
│   │   └── risk/       # RiskAssessment.sol
│   ├── scripts/
│   │   ├── deploy-insurance.js
│   │   └── pre-deploy-check.js
│   ├── test/           # 33 passing tests
│   └── .env            # YOUR PRIVATE KEY HERE
│
└── frontend/           # React + TypeScript
    ├── src/
    │   ├── pages/      # Dashboard, Policies, Claims, Risk
    │   ├── hooks/      # usePolicies, useClaims, useFHE
    │   └── contracts/  # ABIs (auto-copied)
    └── .env            # Auto-generated from deployment

```

## ✅ Deployment Checklist

- [ ] Get Sepolia ETH
- [ ] Configure `contracts/.env`
- [ ] Run `npm run deploy`
- [ ] Verify contract addresses
- [ ] Start frontend
- [ ] Connect wallet to Sepolia
- [ ] Create your first policy!

## 🔧 Current Status

### Contracts (contracts/)
- ✅ PolicyRegistry - Policy management with FHE encryption
- ✅ ClaimsManager - Encrypted claim processing
- ✅ RiskAssessment - Privacy-preserving risk scoring
- ✅ 33/33 tests passing
- ✅ Compiled successfully
- ⏳ **Ready to deploy**

### Frontend (frontend/)
- ✅ All pages implemented
- ✅ FHE integration ready
- ✅ Contract ABIs synced
- ✅ UI components complete
- ⏳ **Waiting for contract addresses**

## 🎭 Features

### Privacy-Preserving Insurance
1. **Create Policies** - Premium & coverage encrypted with FHE
2. **Submit Claims** - Claim amounts remain encrypted
3. **Risk Assessment** - Age, health, credit scores encrypted
4. **Admin Panel** - Approve/reject claims securely

### Technology Stack
- **Encryption**: Zama fhEVM (Fully Homomorphic Encryption)
- **Blockchain**: Ethereum Sepolia Testnet
- **Frontend**: React + Ant Design + Privy Wallet
- **Smart Contracts**: Solidity 0.8.24

## 🎉 After Deployment

Your deployment will output:
```
PolicyRegistry:   0x...
ClaimsManager:    0x...
RiskAssessment:   0x...
```

These addresses are automatically saved to:
- `contracts/deployments/latest.json`
- `frontend/.env`

## 🔗 Useful Links

- **Sepolia Faucet**: https://sepoliafaucet.com
- **Etherscan**: https://sepolia.etherscan.io
- **Zama Docs**: https://docs.zama.ai/fhevm
- **Deployment Guide**: `contracts/DEPLOYMENT.md`

## 🆘 Need Help?

1. Check `contracts/DEPLOYMENT.md` for detailed guide
2. Run `npm run precheck` to diagnose issues
3. Verify `.env` configuration
4. Check deployer account has ETH

---

**Ready?** Run `npm run deploy` in the contracts directory! 🚀
