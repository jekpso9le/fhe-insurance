# VeilSure Frontend

React-based frontend for the VeilSure privacy-preserving insurance platform, featuring Fully Homomorphic Encryption (FHE) for secure data handling.

[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF)](https://vitejs.dev/)
[![fhEVM SDK](https://img.shields.io/badge/fhEVM%20SDK-0.3.0--3-brightgreen)](https://docs.zama.ai/fhevm)

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [FHE Integration](#fhe-integration)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Features

### Core Functionality

- **Policy Management**: Create, view, and renew insurance policies with encrypted premiums and coverage
- **Claims Processing**: Submit and track claims with fully encrypted amounts
- **Risk Assessment**: Create privacy-preserving risk profiles with encrypted health/credit data
- **Admin Dashboard**: Review and approve claims with encrypted payout amounts

### Privacy Features

- **Client-Side Encryption**: All sensitive data encrypted in browser before blockchain submission
- **FHE Operations**: Computations performed on encrypted data without decryption
- **ACL-Protected Access**: Only authorized users can decrypt their own data

### User Experience

- **Wallet Integration**: RainbowKit for seamless multi-wallet support
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-Time Updates**: Live transaction status and toast notifications
- **Linear Design System**: Clean, minimalist interface

---

## Technology Stack

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool & dev server |

### Web3 Integration

| Package | Version | Purpose |
|---------|---------|---------|
| ethers.js | 6.15.0 | Ethereum interaction |
| wagmi | 2.18.2 | React hooks for Ethereum |
| viem | 2.38.4 | TypeScript Ethereum utilities |
| @rainbow-me/rainbowkit | 2.2.9 | Wallet connection UI |
| @tanstack/react-query | 5.90.5 | Async state management |

### FHE (Fully Homomorphic Encryption)

| Package | Version | Purpose |
|---------|---------|---------|
| @zama-fhe/relayer-sdk | 0.3.0-3 | FHE encryption SDK |

### UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| antd | 5.27.6 | Ant Design components |
| @ant-design/icons | 6.1.0 | Icon library |
| tailwindcss | 3.4.17 | Utility-first CSS |
| @radix-ui/* | Various | Headless UI primitives |
| lucide-react | 0.462.0 | Icon set |
| sonner | 1.7.4 | Toast notifications |
| recharts | 2.15.4 | Data visualization |

---

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# Contract Addresses (auto-generated after contract deployment)
VITE_POLICY_REGISTRY_ADDRESS=0xc73446C29070DD3BAa2883c8Ef53325D79ce4211
VITE_CLAIMS_MANAGER_ADDRESS=0x9774Aae0618c7D1B2FB83f52AA2bDc52b4446a89
VITE_RISK_ASSESSMENT_ADDRESS=0x288d4062ee0F1966c1c93f214E374905c7EAe206

# Network Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_GATEWAY_URL=https://gateway.sepolia.zama.ai

# Optional: WalletConnect Project ID
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
```

**Note:** When you deploy contracts using `npm run deploy` in the contracts directory, the `.env` file is automatically generated with the correct addresses.

### Network Configuration

The frontend is configured for **Ethereum Sepolia Testnet**:

| Parameter | Value |
|-----------|-------|
| Chain ID | 11155111 |
| RPC URL | https://ethereum-sepolia-rpc.publicnode.com |
| FHE Gateway | https://gateway.sepolia.zama.ai |

---

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

---

## FHE Integration

### How FHE Encryption Works

```typescript
// 1. Initialize FHE SDK
import { initFhevm, createInstance } from "@zama-fhe/relayer-sdk";

const fhe = await createInstance({
  network: {
    chainId: 11155111,
    gatewayUrl: "https://gateway.sepolia.zama.ai",
  },
});

// 2. Create encrypted input
const input = await fhe.createEncryptedInput(contractAddress, userAddress);
input.add64(premiumAmount);    // Add 64-bit value
input.add64(coverageAmount);   // Add another value

// 3. Encrypt and get handles + proof
const encrypted = await input.encrypt();
// encrypted.handles[0] = premium handle
// encrypted.handles[1] = coverage handle
// encrypted.inputProof = ZK proof

// 4. Submit to smart contract
const tx = await contract.createPolicy(
  policyType,
  encrypted.handles[0],
  encrypted.handles[1],
  encrypted.inputProof,
  encrypted.inputProof,
  durationMonths
);
```

### Encrypted Data Types

| Type | Bit Width | Use Case |
|------|-----------|----------|
| `euint8` | 8-bit | Scores (0-100), age |
| `euint64` | 64-bit | Financial amounts |

---

## Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Navigation.tsx    # Main navigation bar
│   │   ├── PolicyCard.tsx    # Policy display card
│   │   ├── ClaimCard.tsx     # Claim display card
│   │   └── ui/               # Shadcn/Radix UI components
│   │
│   ├── pages/                # Application pages
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── policies/         # Policy management
│   │   │   ├── CreatePolicy.tsx
│   │   │   └── MyPolicies.tsx
│   │   ├── claims/           # Claims management
│   │   │   ├── SubmitClaim.tsx
│   │   │   └── MyClaims.tsx
│   │   ├── RiskAssessment.tsx
│   │   └── Admin.tsx         # Admin panel
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useContracts.ts   # Contract instances
│   │   ├── usePolicies.ts    # Policy operations
│   │   ├── useClaims.ts      # Claims operations
│   │   └── useFHE.ts         # FHE initialization
│   │
│   ├── utils/                # Utility functions
│   │   ├── contracts.ts      # Contract addresses & ABIs
│   │   ├── fhe.ts            # FHE encryption helpers
│   │   ├── formatters.ts     # Data formatting
│   │   └── txToast.tsx       # Transaction toast utility
│   │
│   ├── contracts/            # Contract ABIs (auto-copied)
│   │   ├── PolicyRegistry.json
│   │   ├── ClaimsManager.json
│   │   └── RiskAssessment.json
│   │
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
│
├── public/                   # Static assets
├── .env                      # Environment variables
├── package.json
├── tailwind.config.js        # Tailwind configuration
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
```

---

## Key Features

### Policy Management
- Create new insurance policies with encrypted premium/coverage
- View active, suspended, and expired policies
- Renew policies
- Filter by type and status

### Claims Processing
- Submit claims with encrypted amounts
- Track claim status (Pending -> Approved -> Paid)
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

---

## Design System

Following Linear design principles:

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `#ffffff` | `#0d0d0d` |
| Surface | `#f9fafb` | `#1a1a1a` |
| Primary | `#1677ff` | `#1677ff` |
| Text Primary | `#111827` | `#f3f4f6` |
| Text Secondary | `#6b7280` | `#9ca3af` |

Typography: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`

---

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Vercel Configuration

The project includes `vercel.json` with proper headers for FHE SDK:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Contract addresses not configured" | Ensure `.env` has valid addresses or run contract deployment |
| "Wallet connection failed" | Verify you're on Sepolia network with test ETH |
| "FHE encryption error" | Check COOP/COEP headers and gateway connectivity |
| "Transaction failed" | Ensure sufficient Sepolia ETH for gas |
| "SharedArrayBuffer not defined" | Add required security headers (COOP/COEP) |

---

## Resources

- [React Documentation](https://react.dev/)
- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Ant Design Components](https://ant.design/components/overview/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## License

MIT License - See [LICENSE](../LICENSE) for details.

---

**Built with React, TypeScript, and Zama FHE for privacy-preserving insurance.**
