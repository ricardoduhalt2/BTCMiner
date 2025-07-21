# BTCMiner - Multi-Chain DeFi Platform

![BTCMiner Logo](frontend/public/logoBTCMINER.png)

BTCMiner is a comprehensive multi-chain DeFi platform that enables seamless token operations across Ethereum, BNB Chain, Base, Solana, and Internet Computer Protocol (ICP). The platform features advanced UI animations, dark mode by default, and a sophisticated cross-chain bridge system.

## 🌟 Features

### 🎨 **Advanced UI & Animations**
- **Dark Mode by Default** - Modern, eye-friendly interface
- **Smooth Animations** - Framer Motion powered micro-interactions
- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Accessibility Compliant** - WCAG AA standards with reduced motion support

### 🔗 **Multi-Chain Support**
- **Ethereum** - LayerZero OFT integration
- **BNB Chain** - Cross-chain token operations
- **Base** - Layer 2 scaling solution
- **Solana** - High-performance blockchain
- **ICP** - Internet Computer Protocol for identity and oracles

### 💼 **Wallet Integration**
- **MetaMask** - Ethereum and EVM chains
- **WalletConnect** - Universal wallet connection
- **Phantom** - Solana wallet integration
- **Internet Identity** - ICP authentication

### 🌉 **Cross-Chain Bridge**
- **LayerZero OFT** - Omnichain Fungible Tokens
- **Wormhole** - Solana bridge integration
- **Real-time Tracking** - Transaction status monitoring
- **Gas Optimization** - Cost-effective transfers

### 📊 **DeFi Features**
- **Portfolio Dashboard** - Multi-chain balance aggregation
- **Price Monitoring** - Real-time price feeds and alerts
- **Liquidity Management** - Automated rebalancing
- **Trading Interface** - Advanced order types
- **Analytics** - Comprehensive reporting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ricardoduhalt2/BTCMiner.git
cd BTCMiner
```

2. **Install dependencies**
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
# Add your RPC URLs, private keys, etc.
```

4. **Start Development Server**
```bash
# Start frontend
cd frontend
npm run dev

# In another terminal, compile contracts
npm run compile
```

## 📁 Project Structure

```
BTCMiner/
├── contracts/              # Smart contracts
│   ├── BTCMiner.sol        # Main ERC-20 contract
│   └── WormholeBridge.sol  # Cross-chain bridge
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── scripts/                # Deployment scripts
├── icp/                    # ICP canisters
├── solana/                 # Solana program
├── test/                   # Contract tests
└── .kiro/                  # Kiro IDE specifications
```

## 🛠 Development

### Smart Contracts

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### ICP Development

```bash
cd icp

# Start local replica
dfx start --background

# Deploy canisters
dfx deploy

# Stop replica
dfx stop
```

### Solana Development

```bash
cd solana

# Build program
anchor build

# Test program
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# RPC URLs
ETHEREUM_RPC_URL=your_ethereum_rpc
BSC_RPC_URL=your_bsc_rpc
BASE_RPC_URL=your_base_rpc
SOLANA_RPC_URL=your_solana_rpc

# Private Keys (for deployment)
PRIVATE_KEY=your_private_key

# API Keys
COINGECKO_API_KEY=your_coingecko_key
CHAINLINK_API_KEY=your_chainlink_key

# LayerZero Configuration
LAYERZERO_ENDPOINT_ETHEREUM=0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675
LAYERZERO_ENDPOINT_BSC=0x3c2269811836af69497E5F486A85D7316753cf62
LAYERZERO_ENDPOINT_BASE=0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7

# Wormhole Configuration
WORMHOLE_CORE_BRIDGE_ETHEREUM=0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B
WORMHOLE_CORE_BRIDGE_BSC=0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B
```

## 🎨 UI Features

### Dark Mode & Animations
- **Default Dark Theme** - Elegant dark interface by default
- **Smooth Transitions** - 300ms transitions with easing
- **Micro-interactions** - Button ripples, hover effects
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - Graceful error boundaries

### Responsive Design
- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Adaptive layouts for tablets
- **Desktop Enhanced** - Full-featured desktop experience

## 🔐 Security Features

- **Multi-signature Support** - 3-of-5 multisig governance
- **Daily Limits** - 1M token daily mint limits
- **Emergency Pause** - Circuit breaker functionality
- **Audit Ready** - Prepared for security audits
- **Bug Bounty** - Community security testing

## 📊 Monitoring & Analytics

- **Real-time Metrics** - Live transaction monitoring
- **Price Tracking** - Multi-chain price aggregation
- **Liquidity Health** - Pool health monitoring
- **Performance Analytics** - Gas optimization tracking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [Coming Soon]
- **Documentation**: [Coming Soon]
- **Discord**: [Coming Soon]
- **Twitter**: [Coming Soon]

## ⚠️ Disclaimer

This software is in active development. Use at your own risk. Always do your own research before interacting with smart contracts or DeFi protocols.

---

**Built with ❤️ by the BTCMiner Team**