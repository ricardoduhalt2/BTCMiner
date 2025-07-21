# BTCMiner Testnet Deployments

This directory contains deployment information and scripts for BTCMiner OFT contracts on various testnets.

## 🌐 Supported Testnets

| Network | Chain ID | LayerZero Chain ID | Status | Contract Address |
|---------|----------|-------------------|--------|------------------|
| Ethereum Sepolia | 11155111 | 10161 | ⏳ Pending | - |
| BNB Chain Testnet | 97 | 10102 | ⏳ Pending | - |
| Base Sepolia | 84532 | 10245 | ⏳ Pending | - |

## 🚀 Deployment Process

### Prerequisites

1. **Environment Setup**
   ```bash
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with your private key and RPC URLs
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Compile Contracts**
   ```bash
   npx hardhat compile
   ```

### Single Network Deployment

Deploy to a specific testnet:

```bash
# Deploy to Ethereum Sepolia
npx hardhat run scripts/deploy-testnet.ts --network sepolia

# Deploy to BNB Chain Testnet
npx hardhat run scripts/deploy-testnet.ts --network bscTestnet

# Deploy to Base Sepolia
npx hardhat run scripts/deploy-testnet.ts --network baseSepolia
```

### Multi-Network Deployment

Deploy to all testnets at once:

```bash
npx hardhat run scripts/deploy-all-testnets.ts
```

This script will:
1. Deploy BTCMiner OFT contracts to all configured testnets
2. Set up trusted remotes between all deployed contracts
3. Generate deployment reports
4. Provide verification commands

### Trusted Remote Setup

After deploying to multiple networks, set up cross-chain communication:

```bash
# Set up trusted remotes for a specific network
npx hardhat run scripts/setup-trusted-remotes.ts --network sepolia
npx hardhat run scripts/setup-trusted-remotes.ts --network bscTestnet
npx hardhat run scripts/setup-trusted-remotes.ts --network baseSepolia
```

## 🧪 Testing

### Cross-Chain Functionality Tests

Test deployed contracts:

```bash
# Test on specific network
npx hardhat run scripts/test-cross-chain.ts --network sepolia

# Test all networks (run separately for each)
npx hardhat run scripts/test-cross-chain.ts --network bscTestnet
npx hardhat run scripts/test-cross-chain.ts --network baseSepolia
```

### Test Coverage

The test suite covers:
- ✅ Basic contract functionality (name, symbol, supply)
- ✅ Daily burn limits and tracking
- ✅ Cross-chain gas estimation
- ✅ Trusted remote configuration
- ✅ Access control verification
- ✅ LayerZero endpoint connectivity

## 📋 Contract Verification

After deployment, verify contracts on block explorers:

```bash
# Ethereum Sepolia
npx hardhat verify --network sepolia CONTRACT_ADDRESS "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1" "BTCMiner" "BTCM"

# BNB Chain Testnet
npx hardhat verify --network bscTestnet CONTRACT_ADDRESS "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1" "BTCMiner" "BTCM"

# Base Sepolia
npx hardhat verify --network baseSepolia CONTRACT_ADDRESS "0x6EDCE65403992e310A62460808c4b910D972f10f" "BTCMiner" "BTCM"
```

## 📊 Deployment Files

### Generated Files

- `testnet-deployments.json` - Master deployment registry
- `{network}-deployment.json` - Individual network deployment info
- `multi-testnet-report-{timestamp}.json` - Multi-deployment reports
- `test-reports/{network}-test-report-{timestamp}.json` - Test results

### File Structure

```
deployments/
├── README.md                           # This file
├── testnet-deployments.json           # Master deployment registry
├── sepolia-deployment.json            # Sepolia deployment info
├── bscTestnet-deployment.json          # BSC testnet deployment info
├── baseSepolia-deployment.json         # Base Sepolia deployment info
├── multi-testnet-report-*.json        # Multi-deployment reports
└── test-reports/                       # Test result files
    ├── sepolia-test-report-*.json
    ├── bscTestnet-test-report-*.json
    └── baseSepolia-test-report-*.json
```

## 🔧 Configuration

### LayerZero Endpoints

| Network | Endpoint Address |
|---------|------------------|
| Ethereum Sepolia | `0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1` |
| BNB Chain Testnet | `0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1` |
| Base Sepolia | `0x6EDCE65403992e310A62460808c4b910D972f10f` |

### Contract Parameters

- **Token Name**: BTCMiner
- **Token Symbol**: BTCM
- **Decimals**: 18
- **Initial Supply**: 100,000,000 BTCM
- **Max Daily Burn**: 1,000,000 BTCM per user

## 🚨 Security Features

### Access Control
- **Admin Role**: Contract deployment and configuration
- **Pauser Role**: Emergency pause/unpause functionality
- **Router Role**: Cross-chain routing operations

### Daily Limits
- Maximum 1M tokens can be burned per user per day
- Automatic reset every 24 hours
- Prevents abuse and large-scale attacks

### Emergency Controls
- Pausable contract functionality
- Multi-signature admin controls (to be implemented)
- Time-locked upgrades (to be implemented)

## 🔄 Cross-Chain Operations

### Supported Operations
1. **Cross-Chain Transfers**: Send tokens between supported chains
2. **Burn & Mint**: Burn on source chain, mint on destination
3. **Gas Estimation**: Calculate fees for cross-chain operations
4. **Trusted Remotes**: Secure cross-chain communication paths

### Gas Optimization
- Efficient LayerZero message encoding
- Optimized adapter parameters
- Batch operations support (future)

## 📈 Monitoring

### Key Metrics
- Cross-chain transaction success rate (target: >99%)
- Average transaction time (target: <5 minutes)
- Gas costs per operation
- Daily burn volume per user
- Trusted remote configuration status

### Alerts
- Failed cross-chain transactions
- High gas costs
- Daily burn limit breaches
- Contract pause events

## 🛠️ Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check private key and RPC URL configuration
   - Ensure sufficient ETH balance for gas
   - Verify LayerZero endpoint addresses

2. **Trusted Remote Setup Fails**
   - Ensure contracts are deployed on both chains
   - Check admin role permissions
   - Verify LayerZero chain IDs

3. **Cross-Chain Tests Fail**
   - Confirm trusted remotes are configured
   - Check LayerZero endpoint connectivity
   - Verify contract addresses in deployment files

### Support

For issues and questions:
1. Check deployment logs and error messages
2. Verify environment configuration
3. Test on individual networks before multi-deployment
4. Review LayerZero documentation for endpoint updates

## 🎯 Next Steps

After successful testnet deployment:

1. **Solana Integration** (Task 1.4)
   - Deploy BTCMiner SPL token
   - Implement Wormhole bridge integration
   - Add Pyth oracle for price feeds

2. **ICP Canisters** (Task 1.6)
   - Deploy Digital Identity canister
   - Implement price monitoring
   - Add liquidity health tracking

3. **Frontend Integration**
   - Connect to deployed contracts
   - Implement cross-chain UI
   - Add real-time monitoring

4. **Security Audits**
   - Prepare for professional audits
   - Implement additional security measures
   - Launch bug bounty program