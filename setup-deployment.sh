#!/bin/bash

# 🚀 BTCMiner Deployment Setup Script
# This script will help you configure everything needed for multiverse deployment

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🚀 BTCMiner Deployment Setup                  ║"
echo "║                                                              ║"
echo "║  This script will help you configure your deployment        ║"
echo "║  environment for the multiverse deployment!                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists!"
fi

echo ""
echo "🔑 PRIVATE KEY SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need to add your private key to the .env file."
echo "⚠️  IMPORTANT: Never share your private key with anyone!"
echo ""
echo "Options:"
echo "1. 🔐 Use an existing wallet private key"
echo "2. 🆕 Generate a new test wallet"
echo "3. ⏭️  Skip for now (deployment will fail)"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔐 Using existing wallet:"
        echo "1. Open your wallet (MetaMask, etc.)"
        echo "2. Export your private key"
        echo "3. Edit .env file and add: PRIVATE_KEY=your_key_here"
        echo "   (without the 0x prefix)"
        echo ""
        echo "⚠️  Make sure this wallet has testnet funds:"
        echo "   • Sepolia ETH: https://faucet.quicknode.com/ethereum/sepolia"
        echo "   • BNB Testnet: https://testnet.bnbchain.org/faucet-smart"
        echo "   • Base Sepolia: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
        ;;
    2)
        echo ""
        echo "🆕 Generating new test wallet..."
        # Generate a new private key using node
        node -e "
        const { ethers } = require('ethers');
        const wallet = ethers.Wallet.createRandom();
        console.log('🔑 New Wallet Generated:');
        console.log('Address:', wallet.address);
        console.log('Private Key:', wallet.privateKey.slice(2));
        console.log('');
        console.log('✅ Add this to your .env file:');
        console.log('PRIVATE_KEY=' + wallet.privateKey.slice(2));
        "
        echo ""
        echo "💰 Don't forget to fund this wallet with testnet tokens!"
        ;;
    3)
        echo ""
        echo "⏭️  Skipping private key setup..."
        echo "You can add it later to .env file"
        ;;
esac

echo ""
echo "🌐 RPC ENDPOINTS SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "For better reliability, consider using:"
echo "• 🔗 Infura: https://infura.io/"
echo "• 🔗 Alchemy: https://alchemy.com/"
echo "• 🔗 QuickNode: https://quicknode.com/"
echo ""
echo "Update these in your .env file:"
echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY"
echo "BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/"
echo "BASE_SEPOLIA_RPC_URL=https://sepolia.base.org"

echo ""
echo "🎯 READY TO DEPLOY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Once you've configured your .env file, run:"
echo ""
echo "🚀 npm run 🌌:multiverse     # Deploy to all chains"
echo "🎨 npm run 🎨:dashboard     # Open the dashboard"
echo "🔥 npm run 🔥:deploy-everything  # Full deployment pipeline"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🎉 SETUP COMPLETE!                        ║"
echo "║                                                              ║"
echo "║         Ready to conquer the blockchain multiverse!         ║"
echo "╚══════════════════════════════════════════════════════════════╝"