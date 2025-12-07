# VeilSure: FHE-Powered Privacy-Preserving Insurance Platform

A decentralized insurance platform leveraging **Fully Homomorphic Encryption (FHE)** to enable secure policy management, claims processing, and risk assessment without exposing sensitive personal or financial data on-chain.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue)](https://soliditylang.org/)
[![Zama fhEVM](https://img.shields.io/badge/Zama-fhEVM%200.9.1-brightgreen)](https://docs.zama.ai/fhevm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)

## Table of Contents

- [Overview](#overview)
- [Key Innovation](#key-innovation)
- [System Architecture](#system-architecture)
- [Smart Contract Architecture](#smart-contract-architecture)
- [FHE Technical Deep Dive](#fhe-technical-deep-dive)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Deployed Contracts](#deployed-contracts-sepolia)
- [Unit Testing](#unit-testing)
- [Security Features](#security-features)
- [License](#license)

---

## Overview

Traditional insurance systems expose sensitive personal data including health records, financial information, and risk profiles on public blockchains. **VeilSure** solves this fundamental privacy problem using **Fully Homomorphic Encryption (FHE)** - a cryptographic breakthrough that enables computation on encrypted data without ever decrypting it.

### The Privacy Problem in DeFi Insurance

| Traditional Approach | VeilSure (FHE) |
|---------------------|----------------|
| Premium amounts visible on-chain | Premium amounts encrypted (`euint64`) |
| Claim values publicly exposed | Claim values encrypted end-to-end |
| Health/credit scores readable | Risk factors computed on encrypted data |
| Transaction correlation attacks | Zero-knowledge verification |

---

## Key Innovation

### What Makes VeilSure Different

1. **Encrypted Premium Calculations**: Premium amounts remain encrypted throughout the entire policy lifecycle - from creation to renewal to payout.

2. **Private Claims Processing**: Claim amounts are submitted, reviewed, and approved without anyone (including validators) seeing the actual values.

3. **Confidential Risk Scoring**: Health scores, credit ratings, and demographic data are processed using FHE operations - the contract computes risk scores without ever seeing the inputs.

4. **Zero-Knowledge Verification**: Validate eligibility and coverage limits using encrypted comparisons (`FHE.lte()`, `FHE.gte()`) without revealing sensitive details.

---

## System Architecture

### High-Level Architecture

```
                                    VeilSure Platform Architecture

    ┌──────────────────────────────────────────────────────────────────────────┐
    │                           Frontend (React 18 + TypeScript)                │
    │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             │
    │  │  Policy Mgmt   │  │  Claims Center │  │ Risk Assessment│             │
    │  │  - Create      │  │  - Submit      │  │ - Create Profile│            │
    │  │  - Renew       │  │  - Track       │  │ - View Score    │            │
    │  │  - View        │  │  - Admin       │  │ - Calculate     │            │
    │  └────────────────┘  └────────────────┘  └────────────────┘             │
    └──────────────────────────────────┬───────────────────────────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   Web3 Integration Layer    │
                        │  ┌────────────────────────┐ │
                        │  │ RainbowKit + Wagmi     │ │
                        │  │ @zama-fhe/relayer-sdk  │ │
                        │  │ ethers.js v6           │ │
                        │  └────────────────────────┘ │
                        └──────────────┬──────────────┘
                                       │
    ┌──────────────────────────────────▼───────────────────────────────────────┐
    │                      Ethereum Sepolia Network                             │
    │  ┌─────────────────────────────────────────────────────────────────────┐ │
    │  │                    Smart Contracts (Solidity 0.8.28)                 │ │
    │  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │ │
    │  │  │ PolicyRegistry  │ │  ClaimsManager  │ │ RiskAssessment  │       │ │
    │  │  │                 │ │                 │ │                 │       │ │
    │  │  │ euint64 premium │ │ euint64 amount  │ │ euint8 age      │       │ │
    │  │  │ euint64 coverage│ │ euint64 approved│ │ euint8 health   │       │ │
    │  │  │                 │ │                 │ │ euint8 credit   │       │ │
    │  │  │                 │ │                 │ │ euint8 riskScore│       │ │
    │  │  └─────────────────┘ └─────────────────┘ └─────────────────┘       │ │
    │  └─────────────────────────────────────────────────────────────────────┘ │
    │                                                                           │
    │  ┌─────────────────────────────────────────────────────────────────────┐ │
    │  │              Zama FHE Coprocessor & Gateway                         │ │
    │  │  - Encrypted computation execution (TFHE operations)                │ │
    │  │  - Access Control List (ACL) management                             │ │
    │  │  - Authorized decryption requests                                   │ │
    │  └─────────────────────────────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Policy Creation

```
    User                    Frontend                  Smart Contract           FHE Layer
     │                         │                           │                      │
     │  1. Enter premium=$100  │                           │                      │
     │─────────────────────────>                           │                      │
     │                         │                           │                      │
     │                         │  2. Encrypt locally       │                      │
     │                         │  fhe.createEncryptedInput │                      │
     │                         │  .add64(100).encrypt()    │                      │
     │                         │                           │                      │
     │                         │  3. Submit encrypted      │                      │
     │                         │  handles + proofs         │                      │
     │                         │──────────────────────────>│                      │
     │                         │                           │                      │
     │                         │                           │ 4. Verify proof      │
     │                         │                           │ FHE.fromExternal()   │
     │                         │                           │─────────────────────>│
     │                         │                           │                      │
     │                         │                           │ 5. Store encrypted   │
     │                         │                           │ policy.premium = euint64
     │                         │                           │                      │
     │                         │                           │ 6. Setup ACL         │
     │                         │                           │ FHE.allow(premium, user)
     │                         │                           │<─────────────────────│
     │                         │                           │                      │
     │  7. Policy Created      │                           │                      │
     │<────────────────────────│<──────────────────────────│                      │
```

---

## Smart Contract Architecture

### Contract Overview

| Contract | Purpose | Key Encrypted Fields |
|----------|---------|---------------------|
| **PolicyRegistry** | Policy lifecycle management | `euint64` premium, `euint64` coverage |
| **ClaimsManager** | Claim submission & approval | `euint64` claimAmount, `euint64` approvedAmount |
| **RiskAssessment** | Privacy-preserving risk scoring | `euint8` age, health, credit, riskScore |

### 1. PolicyRegistry (`contracts/PolicyRegistry.sol`)

Manages insurance policy creation and lifecycle with FHE-encrypted financial data.

```solidity
struct Policy {
    uint256 policyId;
    address policyholder;
    PolicyType policyType;        // Health | Property | Life | Cyber
    PolicyStatus status;          // Active | Inactive | Expired | Claimed
    euint64 encryptedPremium;     // FHE-encrypted monthly premium
    euint64 encryptedCoverageAmount; // FHE-encrypted max coverage
    uint64 startDate;
    uint64 endDate;
    uint64 createdAt;
    bool exists;
}
```

**Key Functions:**
- `createPolicy()` - Create policy with encrypted premium/coverage
- `renewPolicy()` - Extend policy duration
- `updatePolicyStatus()` - Manage policy state
- `getPolicyPremium()` - Access encrypted premium (ACL-protected)
- `getPolicyCoverage()` - Access encrypted coverage (ACL-protected)

### 2. ClaimsManager (`contracts/ClaimsManager.sol`)

Handles claim submissions and approval workflow with encrypted amounts.

```solidity
struct Claim {
    uint256 claimId;
    uint256 policyId;
    address claimant;
    ClaimType claimType;          // Medical | PropertyDamage | LifeEvent | CyberIncident
    ClaimStatus status;           // Pending | UnderReview | Approved | Rejected | Paid
    euint64 encryptedClaimAmount; // FHE-encrypted requested amount
    euint64 encryptedApprovedAmount; // FHE-encrypted approved payout
    string description;
    uint64 submittedAt;
    uint64 processedAt;
    bool exists;
}
```

**Claim Workflow:**
```
Pending → UnderReview → Approved/Rejected → Paid
```

### 3. RiskAssessment (`contracts/RiskAssessment.sol`)

Privacy-preserving risk scoring using encrypted user attributes.

```solidity
struct RiskProfile {
    address user;
    euint8 encryptedAge;        // User age (encrypted)
    euint8 encryptedHealthScore; // Health rating 0-100 (encrypted)
    euint8 encryptedCreditScore; // Credit rating 0-100 (encrypted)
    euint8 encryptedRiskScore;   // Calculated score (encrypted)
    uint64 createdAt;
    bool exists;
}
```

**Risk Calculation (computed on encrypted data):**
```solidity
riskScore = age + (100 - healthScore) + (100 - creditScore)
// All operations performed on encrypted values using FHE.add/FHE.sub
// Higher score = Higher risk
```

---

## FHE Technical Deep Dive

### Encryption Types Used

| Type | Bit Width | Use Case | Example |
|------|-----------|----------|---------|
| `euint8` | 8-bit | Scores, percentages | Age, health score (0-100) |
| `euint64` | 64-bit | Financial amounts | Premium, coverage, claims |
| `ebool` | 1-bit | Comparisons | Eligibility checks |

### FHE Operations Available

```solidity
// Arithmetic
FHE.add(euint64 a, euint64 b)     // Encrypted addition
FHE.sub(euint64 a, euint64 b)     // Encrypted subtraction
FHE.mul(euint64 a, euint64 b)     // Encrypted multiplication

// Comparisons (return ebool)
FHE.lt(euint64 a, euint64 b)      // Less than
FHE.lte(euint64 a, euint64 b)     // Less than or equal
FHE.gt(euint64 a, euint64 b)      // Greater than
FHE.eq(euint64 a, euint64 b)      // Equal

// Type conversion
FHE.asEuint8(uint8 value)         // Plaintext to encrypted
FHE.asEuint64(uint64 value)       // Plaintext to encrypted

// Access Control
FHE.allow(euint64 ct, address)    // Grant decryption rights
FHE.allowThis(euint64 ct)         // Contract can compute
```

### Client-Side Encryption Flow

```typescript
// 1. Initialize FHE SDK
const fhe = await initializeFHE(contractAddress, userAddress);

// 2. Create encrypted input
const input = fhe.createEncryptedInput(contractAddress, userAddress);
input.add64(premiumAmount);    // Add 64-bit value
input.add64(coverageAmount);   // Add another 64-bit value

// 3. Encrypt and get handles + proof
const encrypted = await input.encrypt();
// encrypted.handles[0] = encrypted premium handle
// encrypted.handles[1] = encrypted coverage handle
// encrypted.inputProof = zero-knowledge proof

// 4. Submit to smart contract
await policyRegistry.createPolicy(
    policyType,
    encrypted.handles[0],  // externalEuint64
    encrypted.handles[1],  // externalEuint64
    encrypted.inputProof,  // bytes (proof for premium)
    encrypted.inputProof,  // bytes (proof for coverage)
    durationMonths
);
```

### Access Control List (ACL)

FHE data has granular access control:

```solidity
// Only user can decrypt their own premium
FHE.allow(policy.encryptedPremium, msg.sender);

// Contract can perform computations
FHE.allowThis(policy.encryptedPremium);

// Admin can also view (if needed)
FHE.allow(policy.encryptedPremium, owner());
```

---

## Technology Stack

### Smart Contracts

| Component | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | 0.8.28 | Smart contract language |
| **Hardhat** | 2.26.0 | Development environment |
| **@fhevm/solidity** | 0.9.1 | Zama FHE library |
| **@fhevm/hardhat-plugin** | 0.3.0-1 | FHE testing plugin |
| **OpenZeppelin** | 5.4.0 | Security standards (Ownable, ReentrancyGuard) |
| **TypeScript** | 5.8.3 | Test scripts |
| **Chai** | 4.5.0 | Test assertions |

### Frontend

| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 5.4.19 | Build tool |
| **RainbowKit** | 2.2.9 | Wallet connection |
| **Wagmi** | 2.18.2 | Ethereum hooks |
| **Ant Design** | 5.27.6 | UI components |
| **Tailwind CSS** | 3.4.17 | Styling |
| **@zama-fhe/relayer-sdk** | 0.3.0-3 | FHE encryption SDK |
| **ethers.js** | 6.15.0 | Blockchain interaction |

### Network Configuration

| Parameter | Value |
|-----------|-------|
| **Network** | Ethereum Sepolia Testnet |
| **Chain ID** | 11155111 |
| **RPC URL** | https://ethereum-sepolia-rpc.publicnode.com |
| **FHE Gateway** | https://gateway.sepolia.zama.ai |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** (0.05+ ETH) - [Get from faucet](https://sepoliafaucet.com)

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/fhe-insurance.git
cd fhe-insurance

# Install root dependencies (contracts)
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Smart Contract Development

```bash
# From project root

# Configure environment
cp .env.example .env
# Edit .env and add your PRIVATE_KEY

# Compile contracts
npm run compile

# Run unit tests (56 tests)
npm test

# Run specific test suites
npm run test:policy    # PolicyRegistry tests
npm run test:claims    # ClaimsManager tests
npm run test:risk      # RiskAssessment tests

# Deploy to Sepolia
npm run deploy:sepolia
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Visit http://localhost:5173
```

---

## Deployed Contracts (Sepolia)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **PolicyRegistry** | `0xc73446C29070DD3BAa2883c8Ef53325D79ce4211` | [View](https://sepolia.etherscan.io/address/0xc73446C29070DD3BAa2883c8Ef53325D79ce4211) |
| **ClaimsManager** | `0x9774Aae0618c7D1B2FB83f52AA2bDc52b4446a89` | [View](https://sepolia.etherscan.io/address/0x9774Aae0618c7D1B2FB83f52AA2bDc52b4446a89) |
| **RiskAssessment** | `0x288d4062ee0F1966c1c93f214E374905c7EAe206` | [View](https://sepolia.etherscan.io/address/0x288d4062ee0F1966c1c93f214E374905c7EAe206) |

**Deployment Date:** October 27, 2025
**Deployer:** `0x78902b7e1e528FBE442C053Db8853d3F3FB5F35b`

---

## Unit Testing

### Test Framework

- **Framework**: Hardhat + Mocha + Chai
- **FHE Mock**: @fhevm/hardhat-plugin with mock encryption
- **Language**: TypeScript
- **Total Tests**: 56 passing

### Test Commands

```bash
# From project root

# Run all tests
npm test

# Run specific contract tests
npm run test:policy    # PolicyRegistry tests
npm run test:claims    # ClaimsManager tests
npm run test:risk      # RiskAssessment tests
```

### Test Coverage

| Contract | Tests | Coverage Areas |
|----------|-------|----------------|
| **PolicyRegistry** | 21 | Deployment, Policy Creation (FHE), Validation, Renewal, Status Management, Access Control, View Functions |
| **ClaimsManager** | 20 | Deployment, Configuration, Claim Submission (FHE), Validation, Status Management, Approval, Rejection, View Functions |
| **RiskAssessment** | 15 | Deployment, Profile Creation (FHE), Risk Score Calculation, Formula Validation, Access Control, Statistics |

### Test File Structure

```
test/
├── PolicyRegistry.test.ts   # Policy lifecycle tests
├── ClaimsManager.test.ts    # Claims workflow tests
└── RiskAssessment.test.ts   # Risk scoring tests
```

### Example Test Pattern (FHE)

```typescript
it("Should create policy with encrypted premium/coverage", async function () {
    // Create encrypted inputs
    const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(100)  // $100 premium
        .encrypt();

    const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(10000)  // $10,000 coverage
        .encrypt();

    // Create policy with encrypted data
    await policyRegistry.connect(signers.alice).createPolicy(
        PolicyType.Health,
        encryptedPremiumInput.handles[0],
        encryptedCoverageInput.handles[0],
        encryptedPremiumInput.inputProof,
        encryptedCoverageInput.inputProof,
        12  // 12 months
    );

    // Verify policy created
    expect(await policyRegistry.policyCounter()).to.equal(1);
});
```

---

## Security Features

### Encryption Layer

| Feature | Implementation |
|---------|----------------|
| **FHE (Fully Homomorphic Encryption)** | All sensitive data encrypted using Zama's fhEVM |
| **Client-Side Encryption** | Data encrypted in browser before blockchain submission |
| **On-Chain Privacy** | Smart contracts compute on encrypted data without decryption |
| **ACL System** | Granular control over who can decrypt specific data |

### Smart Contract Security

| Feature | Implementation |
|---------|----------------|
| **OpenZeppelin Standards** | Battle-tested Ownable, ReentrancyGuard |
| **Custom Errors** | Gas-efficient error handling |
| **Input Validation** | All inputs validated before processing |
| **Event Logging** | Comprehensive audit trail |
| **Non-Reentrancy** | ReentrancyGuard on state-changing functions |

### FHE Security Properties

1. **Confidentiality**: Encrypted data cannot be read by unauthorized parties (including validators)
2. **Computation Integrity**: Results provably correct without revealing inputs
3. **Access Control**: Only authorized addresses can request decryption
4. **Non-Malleable**: Zero-knowledge proofs prevent tampering with encrypted values

---

## Project Structure

```
fhe-insurance/
├── contracts/                 # Solidity smart contracts (flat structure)
│   ├── PolicyRegistry.sol    # Policy lifecycle management
│   ├── ClaimsManager.sol     # Claims processing workflow
│   └── RiskAssessment.sol    # Privacy-preserving risk scoring
│
├── test/                      # TypeScript test files
│   ├── PolicyRegistry.test.ts
│   ├── ClaimsManager.test.ts
│   └── RiskAssessment.test.ts
│
├── scripts/                   # Deployment scripts
│   ├── deploy-insurance.js   # Main deployment script
│   └── pre-deploy-check.js   # Pre-deployment validation
│
├── deployments/               # Deployment artifacts (JSON)
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Application pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── contracts/        # Contract ABIs
│   ├── package.json
│   └── vite.config.ts
│
├── hardhat.config.ts          # Hardhat configuration
├── tsconfig.json              # TypeScript config
├── package.json               # Root dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## Resources

- **Zama fhEVM Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Zama Website**: [https://www.zama.ai/](https://www.zama.ai/)
- **Sepolia Faucet**: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
- **RainbowKit**: [https://www.rainbowkit.com/](https://www.rainbowkit.com/)
- **Hardhat**: [https://hardhat.org/](https://hardhat.org/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Zama** - For pioneering FHE technology and the fhEVM platform
- **OpenZeppelin** - For secure smart contract libraries
- **Ethereum Foundation** - For Sepolia testnet infrastructure

---

**Built with privacy in mind. Powered by Fully Homomorphic Encryption.**

*VeilSure - Where your insurance data stays yours.*
