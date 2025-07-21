# BTCMiner Advanced Frontend

A sophisticated React-based web application for managing BTCMiner tokens across multiple blockchain networks.

## Features

- 🔗 **Multi-Chain Wallet Integration** - Connect MetaMask, Phantom, WalletConnect, and Internet Identity
- 📊 **Unified Dashboard** - View portfolio across all supported chains
- 🌉 **Cross-Chain Bridge** - Transfer tokens between Ethereum, BNB Chain, Base, and Solana
- 🔐 **Digital Identity** - Internet Computer identity management
- 📈 **Real-Time Price Monitoring** - Live price feeds and alerts
- 💧 **Liquidity Management** - Monitor and manage liquidity positions
- 📱 **Mobile Responsive** - Optimized for all devices
- ⚡ **High Performance** - Built with modern React patterns

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Headless UI
- **State Management**: Redux Toolkit + RTK Query
- **Blockchain**: Ethers.js, Solana Web3.js, ICP Agent
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Lint code

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── layout/         # Layout components
│   ├── wallet/         # Wallet components
│   ├── bridge/         # Bridge components
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── store/              # Redux store and slices
├── services/           # API services
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Supported Chains

- **Ethereum** (Chain ID: 1)
- **BNB Chain** (Chain ID: 56)
- **Base** (Chain ID: 8453)
- **Solana** (Mainnet)
- **Internet Computer** (Identity & Monitoring)

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
VITE_BNB_RPC_URL=https://bsc-dataseed.binance.org/
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

This project is licensed under the MIT License.