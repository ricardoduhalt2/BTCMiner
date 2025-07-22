# BTCMiner - Multi-Chain Token Ecosystem

![BTCMiner Logo](frontend/public/logoBTCMINER.png)

BTCMiner is a comprehensive multi-chain token ecosystem developed by Mining Freedom that enables seamless cross-chain operations, liquidity management, and decentralized identity across Ethereum, BNB Chain, Base, Solana, and Internet Computer Protocol (ICP).

Mining Freedom is dedicated to advancing blockchain technology and cryptocurrency mining solutions, providing innovative tools and platforms for the decentralized finance ecosystem. Our mission is to democratize access to blockchain technology while maintaining the highest standards of security and user experience.

## 🌟 Features

### 🔗 Multi-Chain Support
- **Ethereum** - EVM-compatible smart contracts with LayerZero OFT integration
- **BNB Chain** - High-performance transactions with low fees
- **Base** - Coinbase's L2 solution for scalable operations
- **Solana** - High-speed blockchain with SPL token support
- **ICP** - Internet Computer Protocol for decentralized identity and oracles

### 🎨 Advanced Frontend
- **Dark Mode by Default** - Modern, eye-friendly interface
- **Smooth Animations** - Framer Motion powered micro-interactions
- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Real-time Updates** - WebSocket integration for live data
- **Multi-wallet Support** - MetaMask, WalletConnect, Phantom, Internet Identity

### 🔐 Security Features
- **Multi-signature Governance** - 3-of-5 multisig for admin functions
- **Daily Limits** - 1M token daily mint limits per user
- **Emergency Controls** - Pausable functionality for security
- **Audit Ready** - Prepared for tier-1 security audits

### 💱 Cross-Chain Bridge
- **LayerZero Integration** - Secure cross-chain messaging
- **Wormhole Support** - Solana-EVM bridging
- **Slippage Protection** - For transactions over $10,000
- **Gas Optimization** - Minimize transaction costs

### 📊 Analytics & Monitoring
- **Real-time Price Feeds** - Multi-oracle aggregation
- **Liquidity Analytics** - APY calculations and pool health
- **Portfolio Tracking** - Cross-chain balance aggregation
- **Performance Metrics** - >99% success rate monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Rust and Cargo (for Solana)
- DFX SDK (for ICP)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ricardoduhalt2/BTCMiner.git
cd BTCMiner
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
# Frontend
cd frontend && npm run dev

# Hardhat (separate terminal)
npx hardhat node

# ICP (separate terminal)
cd icp && dfx start --clean
```

## 🏗️ Project Structure

```
BTCMiner/
├── contracts/              # Solidity smart contracts
│   ├── BTCMiner.sol        # Main ERC-20 token with LayerZero OFT
│   └── WormholeBridge.sol  # Cross-chain bridge contract
├── frontend/               # React.js frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Redux store and slices
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── icp/                   # Internet Computer canisters
│   ├── src/identity/      # Digital identity canister
│   ├── src/price_monitor/ # Price oracle canister
│   └── src/liquidity_health/ # Liquidity monitoring
├── solana/                # Solana program
│   ├── src/lib.rs         # Anchor program
│   └── tests/             # Solana tests
├── scripts/               # Deployment and utility scripts
├── test/                  # Smart contract tests
└── deployments/           # Deployment configurations
```

## 🔧 Development

### Smart Contracts (Hardhat)
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy-testnet.ts --network bscTestnet
```

### Frontend (React + Vite)
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### Solana Program (Anchor)
```bash
cd solana

# Build program
anchor build

# Test program
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### ICP Canisters (DFX)
```bash
cd icp

# Start local replica
dfx start --clean

# Deploy canisters
dfx deploy

# Interact with canisters
dfx canister call btcminer_identity register_wallet
```

## 🌐 Deployment

### Testnet Deployment
```bash
# Deploy to all testnets
npm run deploy:testnets

# Deploy specific chain
npm run deploy:ethereum-testnet
npm run deploy:bsc-testnet
npm run deploy:base-testnet
```

### Mainnet Deployment
```bash
# Deploy to all mainnets (requires audit)
npm run deploy:mainnets
```

## 📋 Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Multi-chain smart contracts
- [x] LayerZero OFT integration
- [x] Basic frontend interface
- [x] Wallet connections

### Phase 2: Advanced Features ✅
- [x] Cross-chain bridging
- [x] Real-time price feeds
- [x] Dark mode UI with animations
- [x] Identity management

### Phase 3: DeFi Integration 🚧
- [ ] Liquidity pools and farming
- [ ] Advanced trading features
- [ ] Portfolio analytics
- [ ] Mobile app (PWA)

### Phase 4: Governance & Security 📋
- [ ] DAO governance token
- [ ] Security audits
- [ ] Bug bounty program
- [ ] Mainnet launch

## 🔒 Security

- **Audits**: Prepared for Certik, OtterSec, and Halborn audits
- **Bug Bounty**: Community-driven security testing
- **Multisig**: 3-of-5 multisig for critical operations
- **Limits**: Daily transaction limits and emergency controls

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Website**: [Mining Freedom](https://miningfreedom.com/)
- **Email**: contact@miningfreedom.com
- **GitHub Issues**: [Report bugs and request features](https://github.com/ricardoduhalt2/BTCMiner/issues)
- **Documentation**: [Project Wiki](https://github.com/ricardoduhalt2/BTCMiner/wiki)

For technical support, business inquiries, or partnership opportunities, please reach out to us at contact@miningfreedom.com or visit our website at https://miningfreedom.com/.

## 🏢 About Mining Freedom

Mining Freedom is committed to advancing blockchain technology and cryptocurrency solutions. We specialize in developing innovative tools and platforms that make decentralized finance more accessible while maintaining enterprise-grade security standards.

Our expertise spans across:
- Multi-chain blockchain development
- Smart contract architecture and security
- DeFi protocol design and implementation
- Cross-chain interoperability solutions
- Cryptocurrency mining and staking infrastructure

## 🙏 Acknowledgments

- LayerZero Labs for cross-chain infrastructure
- Wormhole for Solana bridging
- Internet Computer for decentralized identity
- Supabase for backend infrastructure
- The amazing DeFi and open-source community

---

**Built with ❤️ by Mining Freedom**

*Democratizing access to blockchain technology*