# FHE Insurance Platform

A privacy-preserving insurance platform leveraging Fully Homomorphic Encryption (FHE) to enable secure policy management, claims processing, and risk assessment without exposing sensitive personal or financial data on-chain.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![Zama fhEVM](https://img.shields.io/badge/Zama-fhEVM%200.8.0-brightgreen)](https://docs.zama.ai/fhevm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

Traditional insurance systems expose sensitive personal data including health records, financial information, and risk profiles. This platform uses **Fully Homomorphic Encryption (FHE)** to enable computation on encrypted data, allowing insurance operations while preserving complete privacy.

### Key Innovation

- **Encrypted Premium Calculations**: Premium amounts remain encrypted throughout the policy lifecycle
- **Private Claims Processing**: Claim amounts are submitted and processed without decryption
- **Confidential Risk Scoring**: Health, credit, and demographic data never exposed on-chain
- **Zero-Knowledge Verification**: Validate eligibility and coverage without revealing sensitive details

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Policies   │  │    Claims    │  │  Risk Score  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ RainbowKit + Wagmi
                         │ FHE SDK (@zama-fhe/relayer-sdk)
┌────────────────────────▼────────────────────────────────────┐
│              Ethereum Sepolia Testnet                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Smart Contracts (Solidity)                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │   Policy     │  │   Claims     │  │   Risk   │ │   │
│  │  │  Registry    │  │   Manager    │  │Assessment│ │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                    FHE Computation Layer                    │
│              (Zama fhEVM Gateway & Coprocessor)            │
└─────────────────────────────────────────────────────────────┘
```

### Smart Contracts

#### 1. **PolicyRegistry** (`contracts/src/policies/PolicyRegistry.sol`)

Manages insurance policy creation and lifecycle with FHE-encrypted premium and coverage amounts.

**Core Functions**:
- `createPolicy()` - Create new policy with encrypted premium/coverage
- `renewPolicy()` - Extend policy duration
- `updatePolicyStatus()` - Manage policy state (Active/Suspended/Cancelled/Expired)
- `getUserPolicies()` - Retrieve user's policy IDs
- `getPolicyDetails()` - Access non-sensitive policy information

**FHE Data**:
- `euint64 encryptedPremium` - Monthly premium amount (encrypted)
- `euint64 encryptedCoverageAmount` - Maximum coverage limit (encrypted)

**Policy Types**:
- `Health` - Medical expense coverage
- `Property` - Asset protection
- `Life` - Term/whole life insurance
- `Cyber` - Digital asset protection

#### 2. **ClaimsManager** (`contracts/src/claims/ClaimsManager.sol`)

Handles claim submissions and processing with encrypted claim amounts.

**Core Functions**:
- `submitClaim()` - Submit encrypted claim with description
- `approveClaim()` - Approve claim with encrypted approved amount
- `rejectClaim()` - Reject claim with reason
- `markClaimPaid()` - Mark claim as paid
- `getUserClaims()` - Retrieve user's claims
- `getClaimDetails()` - Access non-sensitive claim data

**FHE Data**:
- `euint64 encryptedClaimAmount` - Requested claim amount (encrypted)
- `euint64 encryptedApprovedAmount` - Approved payout amount (encrypted)

**Claim Flow**:
```
Pending → UnderReview → Approved/Rejected → Paid
```

#### 3. **RiskAssessment** (`contracts/src/risk/RiskAssessment.sol`)

Privacy-preserving risk scoring using encrypted user attributes.

**Core Functions**:
- `createRiskProfile()` - Create profile with encrypted health/credit data
- `getRiskScore()` - Retrieve encrypted risk score
- `hasRiskProfile()` - Check profile existence

**FHE Data**:
- `euint8 encryptedAge` - User age (encrypted)
- `euint8 encryptedHealthScore` - Health rating 0-100 (encrypted)
- `euint8 encryptedCreditScore` - Credit rating 0-100 (encrypted)
- `euint8 encryptedRiskScore` - Calculated risk score (encrypted)

**Risk Calculation** (on encrypted data):
```solidity
riskScore = age + (100 - healthScore) + (100 - creditScore)
// Higher value = Higher risk (all computed on encrypted values)
```

## 🔐 How FHE Works in This System

### 1. **Data Encryption Flow**

```javascript
// Frontend: User inputs sensitive data
const premium = 1000; // User's monthly premium
const coverage = 50000; // Coverage amount

// FHE SDK encrypts data client-side
const fhe = await initializeFHE();
const input = fhe.createEncryptedInput(contractAddress, userAddress);
input.add64(premium);  // Encrypt as euint64
input.add64(coverage);
const encrypted = await input.encrypt();

// Submit encrypted handles + proofs to smart contract
await policyRegistry.createPolicy(
  policyType,
  encrypted.handles[0], // Encrypted premium
  encrypted.handles[1], // Encrypted coverage
  encrypted.proof       // Zero-knowledge proof
);
```

### 2. **On-Chain Computation**

```solidity
// Smart contract receives encrypted data
function createPolicy(
    PolicyType policyType,
    externalEuint64 encryptedPremium,     // Encrypted input
    externalEuint64 encryptedCoverage,
    bytes calldata premiumProof,
    bytes calldata coverageProof,
    uint256 durationMonths
) external {
    // Convert external encrypted input to internal encrypted type
    euint64 premium = FHE.fromExternal(encryptedPremium, premiumProof);
    euint64 coverage = FHE.fromExternal(encryptedCoverage, coverageProof);

    // Set up access control - who can decrypt this data
    FHE.allow(premium, msg.sender);   // Only user can decrypt
    FHE.allowThis(premium);           // Contract can compute

    // Store encrypted values on-chain
    policies[policyId].encryptedPremium = premium;
    policies[policyId].encryptedCoverageAmount = coverage;

    // All sensitive data remains encrypted!
}
```

### 3. **Privacy-Preserving Operations**

The system can perform operations on encrypted data without ever seeing the plaintext:

```solidity
// Example: Check if claim amount <= coverage (without revealing amounts)
ebool isValidClaim = FHE.lte(claimAmount, coverageAmount);

// Example: Calculate risk score from encrypted inputs
euint8 riskScore = FHE.add(
    age,
    FHE.add(
        FHE.sub(FHE.asEuint8(100), healthScore),
        FHE.sub(FHE.asEuint8(100), creditScore)
    )
);
```

### 4. **Decryption (When Authorized)**

Only authorized parties can request decryption through the Zama Gateway:

```javascript
// Request decryption (requires user signature)
const { publicKey, signature } = await fhe.generateToken();
const encryptedValue = await contract.getPolicyPremium(policyId);
const decryptedPremium = await fhe.decrypt(encryptedValue, publicKey, signature);
console.log("Premium:", decryptedPremium); // Only visible to authorized user
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** (0.05+ ETH) - [Get from faucet](https://sepoliafaucet.com)

### Installation

```bash
# Clone repository
git clone https://github.com/jekpso9le/fhe-insurance.git
cd fhe-insurance

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Smart Contract Deployment

```bash
cd contracts

# Configure environment
cp .env.example .env
# Edit .env and add your PRIVATE_KEY

# Compile contracts
npm run compile

# Run tests (33 tests)
npm test

# Deploy to Sepolia
npm run deploy
```

The deployment script will:
1. Deploy PolicyRegistry, ClaimsManager, and RiskAssessment
2. Link contracts together
3. Auto-generate `frontend/.env` with contract addresses
4. Save deployment info to `contracts/deployments/`

### Frontend Setup

```bash
cd frontend

# Start development server
npm run dev

# Visit http://localhost:8080
```

The frontend will automatically connect to the deployed contracts on Sepolia.

## 📱 Usage Guide

### 1. Connect Wallet

- Click "Connect Wallet" in navigation
- Select wallet provider (MetaMask, WalletConnect, Coinbase Wallet)
- Approve connection and switch to Sepolia network

### 2. Create Insurance Policy

**Navigate to**: Policies → Create New Policy

**Steps**:
1. Select policy type (Health/Property/Life/Cyber)
2. Enter monthly premium (will be encrypted)
3. Enter coverage amount (will be encrypted)
4. Set policy duration (months)
5. Sign transaction

**What Happens**:
- Frontend encrypts premium and coverage using FHE SDK
- Encrypted values sent to `PolicyRegistry.createPolicy()`
- Policy stored on-chain with fully encrypted financial data
- Policy ID returned for future reference

### 3. Submit Insurance Claim

**Navigate to**: Claims → Submit Claim

**Steps**:
1. Select policy ID
2. Choose claim type (Medical/Property/Cyber)
3. Enter claim amount (will be encrypted)
4. Provide description
5. Sign transaction

**What Happens**:
- Claim amount encrypted client-side
- Submitted to `ClaimsManager.submitClaim()`
- Claim enters "Pending" status
- Admin can review and approve/reject

### 4. Create Risk Profile

**Navigate to**: Risk Assessment

**Steps**:
1. Enter age (will be encrypted)
2. Enter health score 0-100 (will be encrypted)
3. Enter credit score 0-100 (will be encrypted)
4. Sign transaction

**What Happens**:
- All inputs encrypted using FHE
- Risk score calculated on encrypted data
- Profile stored without exposing sensitive information
- Can be used for premium calculation or underwriting

### 5. Admin Functions (Contract Owner Only)

**Navigate to**: Admin Panel

**Available Actions**:
- Review submitted claims
- Approve claims with encrypted payout amount
- Reject claims with reason
- Update policy statuses
- View aggregate statistics

## 🛠️ Technology Stack

### Smart Contracts

| Component | Version | Purpose |
|-----------|---------|---------|
| Solidity | 0.8.24 | Smart contract language |
| Hardhat | 2.26.3 | Development environment |
| @fhevm/solidity | 0.8.0 | FHE encryption library |
| OpenZeppelin | 5.4.0 | Security standards |

### Frontend

| Component | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool |
| RainbowKit | 2.2.9 | Wallet connection |
| Wagmi | 2.18.2 | Ethereum hooks |
| Ant Design | 5.27.6 | UI components |
| @zama-fhe/relayer-sdk | 0.3.0 | FHE encryption SDK |

### Blockchain

- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **RPC**: https://ethereum-sepolia-rpc.publicnode.com
- **FHE Gateway**: https://gateway.sepolia.zama.ai

## 📊 Deployed Contracts (Sepolia)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **PolicyRegistry** | `0xc73446C29070DD3BAa2883c8Ef53325D79ce4211` | [View](https://sepolia.etherscan.io/address/0xc73446C29070DD3BAa2883c8Ef53325D79ce4211) |
| **ClaimsManager** | `0x9774Aae0618c7D1B2FB83f52AA2bDc52b4446a89` | [View](https://sepolia.etherscan.io/address/0x9774Aae0618c7D1B2FB83f52AA2bDc52b4446a89) |
| **RiskAssessment** | `0x288d4062ee0F1966c1c93f214E374905c7EAe206` | [View](https://sepolia.etherscan.io/address/0x288d4062ee0F1966c1c93f214E374905c7EAe206) |

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
npm test
```

**Test Coverage**:
- ✅ PolicyRegistry: 11 tests (policy creation, renewal, status updates)
- ✅ ClaimsManager: 11 tests (claim submission, approval, rejection, payout)
- ✅ RiskAssessment: 11 tests (profile creation, risk scoring, access control)
- ✅ **Total**: 33 passing tests

### Test Scenarios

**PolicyRegistry Tests**:
- Should create policy with encrypted premium/coverage
- Should prevent non-owner from updating policy status
- Should track multiple policies per user
- Should handle policy renewal correctly

**ClaimsManager Tests**:
- Should submit claim with encrypted amount
- Should transition claim through approval workflow
- Should prevent duplicate processing
- Should enforce access control

**RiskAssessment Tests**:
- Should create risk profile with encrypted data
- Should calculate risk score on encrypted values
- Should prevent profile duplication
- Should restrict unauthorized access

## 🔒 Security Features

### Encryption

- **FHE (Fully Homomorphic Encryption)**: All sensitive data encrypted using Zama's fhEVM
- **Client-Side Encryption**: Data encrypted before leaving user's browser
- **On-Chain Privacy**: Smart contracts compute on encrypted data without decryption
- **Access Control**: ACL system controls who can decrypt specific data

### Smart Contract Security

- **OpenZeppelin Standards**: Uses battle-tested security patterns
- **Ownable**: Admin functions restricted to contract owner
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Custom Errors**: Gas-efficient error handling
- **Event Logging**: Comprehensive audit trail

### FHE Security Properties

1. **Confidentiality**: Encrypted data cannot be read by unauthorized parties
2. **Computation Integrity**: Results provably correct without revealing inputs
3. **Access Control**: Only authorized addresses can decrypt data
4. **Non-Malleable**: Proofs prevent tampering with encrypted values

## 📖 Documentation

- **[Quick Start Guide](./QUICK-START.md)** - Get running in 5 minutes
- **[Deployment Guide](./contracts/DEPLOYMENT.md)** - Detailed deployment instructions
- **[Zama fhEVM Docs](https://docs.zama.ai/fhevm)** - FHE encryption documentation

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- **Zama**: [https://www.zama.ai/](https://www.zama.ai/)
- **fhEVM Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Sepolia Faucet**: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
- **RainbowKit**: [https://www.rainbowkit.com/](https://www.rainbowkit.com/)
- **Hardhat**: [https://hardhat.org/](https://hardhat.org/)

## 🙏 Acknowledgments

- **Zama** - For pioneering FHE technology and the fhEVM platform
- **OpenZeppelin** - For secure smart contract libraries
- **Ethereum Foundation** - For Sepolia testnet infrastructure

---

**Built with privacy in mind. Powered by Fully Homomorphic Encryption.**
