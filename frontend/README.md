# VeilSure Insurance Platform - Frontend

A privacy-preserving insurance platform built with Fully Homomorphic Encryption (FHE) using Zama's fhEVM technology.

## 🚀 Features

- **Privacy-Preserving Insurance**: Create policies with encrypted premium and coverage amounts
- **Confidential Claims**: Submit and process claims with fully encrypted amounts
- **Risk Assessment**: Encrypted health, age, and credit score evaluation
- **Admin Dashboard**: Manage claims and policies with FHE-protected data
- **Wallet Integration**: Seamless Privy wallet connection for Web3 authentication

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **UI Components**: Ant Design 5.0 + Shadcn/ui
- **Styling**: Tailwind CSS
- **Web3**: ethers.js v6 + Privy SDK
- **Encryption**: fhevmjs (Zama FHE)
- **Network**: Ethereum Sepolia Testnet

## 📋 Prerequisites

- Node.js v18+ and npm
- Deployed smart contracts on Sepolia (see `../contracts/`)
- Privy App ID (optional for wallet integration)

## 🔧 Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables
# Edit .env with your contract addresses
```

## ⚙️ Environment Configuration

Create a `.env` file with the following variables:

```env
# Contract Addresses (auto-generated after deployment)
VITE_POLICY_REGISTRY_ADDRESS=0x...
VITE_CLAIMS_MANAGER_ADDRESS=0x...
VITE_RISK_ASSESSMENT_ADDRESS=0x...

# Network Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_GATEWAY_URL=https://gateway.sepolia.zama.ai

# Wallet Integration (optional)
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

**Note**: The `.env` file is automatically generated after deploying contracts via the deployment script.

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## 📦 Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navigation.tsx  # Main navigation
│   │   ├── PolicyCard.tsx  # Policy display card
│   │   ├── ClaimCard.tsx   # Claim display card
│   │   └── ui/             # Shadcn UI components
│   ├── pages/              # Application pages
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── policies/       # Policy management pages
│   │   ├── claims/         # Claims management pages
│   │   ├── RiskAssessment.tsx
│   │   └── Admin.tsx       # Admin panel
│   ├── hooks/              # Custom React hooks
│   │   ├── useContracts.ts # Contract interaction
│   │   ├── usePolicies.ts  # Policy management
│   │   ├── useClaims.ts    # Claims management
│   │   └── useFHE.ts       # FHE encryption
│   ├── utils/              # Utility functions
│   │   ├── contracts.ts    # Contract utilities
│   │   ├── fhe.ts          # FHE encryption helpers
│   │   └── formatters.ts   # Data formatters
│   ├── contracts/          # Contract ABIs (auto-copied)
│   │   ├── PolicyRegistry.json
│   │   ├── ClaimsManager.json
│   │   └── RiskAssessment.json
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env                    # Environment variables (generated)
├── package.json
└── vite.config.ts
```

## 🎨 Design System

The application follows the Linear design style:

- **Colors**: High contrast neutral tones (gray, black, white)
- **Primary**: Blue (#1677ff)
- **Typography**: -apple-system, BlinkMacSystemFont, Segoe UI
- **Components**: Minimalist, clean interfaces
- **Layout**: Card-based responsive design

## 🔐 FHE Integration

### Encryption Flow

1. **User Input**: Enter sensitive data (premium, coverage, claim amount)
2. **FHE Encryption**: Data encrypted using fhevmjs before blockchain submission
3. **On-Chain Storage**: Encrypted values stored as `euint64` or `euint8`
4. **Privacy Preserved**: Data remains encrypted throughout entire lifecycle

### Encrypted Data Types

- `euint64`: Financial amounts (premium, coverage, claims)
- `euint8`: Scores and factors (age, health score, credit score)

## 📱 Key Features

### Policy Management
- Create new insurance policies with encrypted premium/coverage
- View active, suspended, and expired policies
- Renew policies
- Filter by type and status

### Claims Processing
- Submit claims with encrypted amounts
- Track claim status (Pending → Approved → Paid)
- View claim history
- Admin approval workflow

### Risk Assessment
- Create encrypted risk profiles
- Input age, health score, credit score (all encrypted)
- View risk score visualization
- Privacy-preserving calculations

### Admin Panel
- Review pending claims
- Approve/reject claims with encrypted amounts
- System statistics and metrics
- User management

## 🔗 Smart Contract Integration

The frontend interacts with three main contracts:

1. **PolicyRegistry**: Policy creation and management
2. **ClaimsManager**: Claim submission and processing
3. **RiskAssessment**: Risk profile evaluation

All contract addresses must be configured in `.env` before running the application.

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

When deploying, ensure all environment variables from `.env` are configured in your hosting platform.

## 🧪 Testing

```bash
# Run tests (if configured)
npm test
```

## 📝 Development Workflow

1. **Deploy Contracts**: Deploy smart contracts to Sepolia (see `../contracts/`)
2. **Configure Environment**: `.env` is auto-generated with contract addresses
3. **Install Dependencies**: `npm install`
4. **Start Development**: `npm run dev`
5. **Connect Wallet**: Use Sepolia testnet
6. **Test Features**: Create policies, submit claims, assess risk

## 🆘 Troubleshooting

### Issue: "Contract addresses not configured"
**Solution**: Ensure contracts are deployed and `.env` has valid addresses

### Issue: "Wallet connection failed"
**Solution**: Check that you're on Sepolia network and have test ETH

### Issue: "FHE encryption error"
**Solution**: Verify fhevmjs is properly initialized and network is accessible

### Issue: "Transaction failed"
**Solution**: Ensure you have sufficient Sepolia ETH for gas fees

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use test accounts only for Sepolia testnet
- Verify contract addresses before transactions
- Keep Privy App ID secure

## 📚 Resources

- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [Privy Wallet Integration](https://docs.privy.io/)
- [Ant Design Components](https://ant.design/components/overview/)
- [React Documentation](https://react.dev/)

## 🤝 Contributing

1. Follow existing code style
2. Use TypeScript for type safety
3. Follow Linear design principles
4. Test on Sepolia before submitting

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ using Zama FHE technology
