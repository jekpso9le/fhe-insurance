# FHE Confidential Insurance Platform

## Overview
A privacy-preserving insurance platform using fully homomorphic encryption to enable secure policy management, claims processing, and risk assessment without exposing sensitive personal or financial data.

## Key Features
- **Privacy-Preserving Policies**: FHE-encrypted policy data and personal information
- **Secure Claims Processing**: Encrypted claim submissions with zero-knowledge verification
- **Risk Assessment**: FHE-based risk scoring without exposing individual data
- **Decentralized Underwriting**: Community-based risk pooling with privacy protection
- **Automated Payouts**: Smart contract-based claim settlements
- **Regulatory Compliance**: Built-in compliance with privacy regulations

## Technical Architecture

### Smart Contracts
- **PolicyRegistry**: Manages insurance policy creation and lifecycle
- **ClaimsManager**: Handles claim submissions and processing
- **RiskAssessment**: FHE-based risk scoring and underwriting
- **PayoutVault**: Manages premium collection and claim payouts
- **UnderwritingPool**: Decentralized risk pooling mechanism
- **FHEPrivacyEngine**: Handles FHE encryption/decryption for sensitive data
- **ComplianceModule**: Ensures regulatory compliance

### Frontend
- **Policy Dashboard**: Manage insurance policies and coverage
- **Claims Center**: Submit and track insurance claims
- **Risk Assessment**: Get personalized risk scores with privacy
- **Underwriting Portal**: Participate in risk pooling
- **Analytics Hub**: View market trends and statistics
- **Compliance Center**: Manage regulatory requirements

## Project Structure (Insurance-Specific)

### Contracts
- `contracts/src/policies/`: Policy management and lifecycle contracts
- `contracts/src/claims/`: Claims processing and verification contracts
- `contracts/src/risk/`: Risk assessment and underwriting contracts
- `contracts/src/payouts/`: Payment and settlement contracts
- `contracts/src/fhe/`: FHE privacy and encryption contracts
- `contracts/src/compliance/`: Regulatory compliance contracts
- `contracts/interfaces/`: Insurance-specific interfaces
- `contracts/scripts/`: Deployment and testing scripts
- `contracts/test/`: Comprehensive insurance testing suite

### Frontend
- `frontend/src/insurance/`: Main insurance application and routing
- `frontend/src/pages/policies/`: Policy management pages (create, view, manage)
- `frontend/src/pages/claims/`: Claims processing pages (submit, track, review)
- `frontend/src/pages/risk/`: Risk assessment and underwriting pages
- `frontend/src/components/coverage/`: Coverage calculation components
- `frontend/src/components/claims/`: Claims processing components
- `frontend/src/hooks/`: Insurance-specific hooks (policies, claims, risk)
- `frontend/src/config/`: Web3 and insurance configurations
- `frontend/styles/`: Insurance-themed CSS (policy cards, claim forms, risk indicators)

### Documentation
- `docs/insurance-mechanics.md`: Insurance product explanations
- `docs/claims-process.md`: Claims submission and processing workflow
- `docs/risk-assessment.md`: FHE-based risk scoring methodology
- `docs/privacy-compliance.md`: Privacy protection and regulatory compliance
- `docs/runbooks/`: Operational guides (claims processing, risk monitoring, compliance)

## Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH

### Installation
```bash
# Install dependencies
cd fhe-insurance/contracts && npm install
cd ../frontend && npm install

# Start development
cd contracts && npm run compile
cd ../frontend && npm run dev
```

### Usage
1. Connect MetaMask to Sepolia network
2. Browse available insurance products
3. Create policies or submit claims
4. Monitor risk assessment and underwriting
5. Track claims processing and payouts

## Insurance Products

### Health Insurance
- Medical expense coverage
- FHE-protected health data
- Automated claim verification
- Privacy-preserving diagnostics

### Property Insurance
- Asset protection coverage
- Encrypted property valuations
- Smart contract-based claims
- Decentralized risk assessment

### Life Insurance
- Term and whole life policies
- FHE-encrypted beneficiary data
- Automated payout triggers
- Privacy-protected underwriting

### Cyber Insurance
- Digital asset protection
- FHE-based risk scoring
- Incident response coverage
- Privacy-preserving audits

## Security Features
- **FHE Data Encryption**: All sensitive data encrypted with FHE
- **Zero-Knowledge Proofs**: Verify claims without revealing details
- **Decentralized Storage**: IPFS-based document storage
- **Multi-Signature Wallets**: Secure fund management
- **Audit Trails**: Immutable claim and policy records
- **Regulatory Compliance**: Built-in GDPR and HIPAA compliance

## Development

### Contract Development
```bash
cd contracts
npm run compile
npm run test
npm run deploy:sepolia
```

### Frontend Development
```bash
cd frontend
npm run dev
npm run build
npm run preview
```

### Testing
```bash
# Contract tests
cd contracts && npm run test

# Frontend tests  
cd frontend && npm run test

# Integration tests
npm run test:integration
```

## Contributing
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request

## License
MIT License - see LICENSE file for details

## Related Links
- [Zama Protocol Documentation](https://docs.zama.ai/)
- [FHE Solidity Developer Guide](https://docs.zama.ai/fhevm)
- [Sepolia Testnet Faucet](https://sepoliafaucet.com/)