#!/bin/bash

# 🚀 BTCMiner ICP Canisters Deployment Script
# Deploys all ICP canisters for BTCMiner ecosystem

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ICP_DIR="icp"
NETWORK="local"  # Change to "ic" for mainnet deployment

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                🚀 BTCMiner ICP Deployment                    ║${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}║  Deploying Digital Identity, Price Monitor & Liquidity      ║${NC}"
echo -e "${BLUE}║  Health canisters to Internet Computer Protocol             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo -e "${RED}❌ Error: dfx is not installed.${NC}"
    echo -e "${YELLOW}Please install the Internet Computer SDK:${NC}"
    echo "curl -fsSL https://internetcomputer.org/install.sh | sh"
    exit 1
fi

# Check dfx version
echo -e "${CYAN}🔍 Checking dfx version...${NC}"
dfx --version

# Navigate to ICP directory
cd "$ICP_DIR"

# Check if dfx.json exists
if [ ! -f "dfx.json" ]; then
    echo -e "${RED}❌ Error: dfx.json not found in $ICP_DIR directory${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Found dfx.json configuration${NC}"

# Start local replica if deploying locally
if [ "$NETWORK" = "local" ]; then
    echo -e "${YELLOW}🔄 Starting local Internet Computer replica...${NC}"
    
    # Check if replica is already running
    if ! dfx ping &> /dev/null; then
        dfx start --background --clean
        echo -e "${GREEN}✅ Local replica started${NC}"
        
        # Wait for replica to be ready
        echo -e "${YELLOW}⏳ Waiting for replica to be ready...${NC}"
        sleep 5
    else
        echo -e "${GREEN}✅ Local replica already running${NC}"
    fi
fi

# Deploy canisters
echo -e "${PURPLE}📦 Deploying BTCMiner canisters...${NC}"
echo ""

# Deploy Identity canister
echo -e "${CYAN}🆔 Deploying Digital Identity canister...${NC}"
if dfx deploy btcminer_identity --network "$NETWORK"; then
    echo -e "${GREEN}✅ Digital Identity canister deployed successfully${NC}"
    IDENTITY_CANISTER_ID=$(dfx canister id btcminer_identity --network "$NETWORK")
    echo -e "${BLUE}   Canister ID: $IDENTITY_CANISTER_ID${NC}"
else
    echo -e "${RED}❌ Failed to deploy Digital Identity canister${NC}"
    exit 1
fi

echo ""

# Deploy Price Monitor canister
echo -e "${CYAN}📊 Deploying Price Monitor canister...${NC}"
if dfx deploy btcminer_price_monitor --network "$NETWORK"; then
    echo -e "${GREEN}✅ Price Monitor canister deployed successfully${NC}"
    PRICE_CANISTER_ID=$(dfx canister id btcminer_price_monitor --network "$NETWORK")
    echo -e "${BLUE}   Canister ID: $PRICE_CANISTER_ID${NC}"
else
    echo -e "${RED}❌ Failed to deploy Price Monitor canister${NC}"
    exit 1
fi

echo ""

# Deploy Liquidity Health canister
echo -e "${CYAN}💧 Deploying Liquidity Health canister...${NC}"
if dfx deploy btcminer_liquidity_health --network "$NETWORK"; then
    echo -e "${GREEN}✅ Liquidity Health canister deployed successfully${NC}"
    LIQUIDITY_CANISTER_ID=$(dfx canister id btcminer_liquidity_health --network "$NETWORK")
    echo -e "${BLUE}   Canister ID: $LIQUIDITY_CANISTER_ID${NC}"
else
    echo -e "${RED}❌ Failed to deploy Liquidity Health canister${NC}"
    exit 1
fi

echo ""

# Test basic functionality
echo -e "${PURPLE}🧪 Testing basic canister functionality...${NC}"
echo ""

# Test Identity canister
echo -e "${CYAN}🆔 Testing Digital Identity canister...${NC}"
if dfx canister call btcminer_identity getSupportedChains --network "$NETWORK"; then
    echo -e "${GREEN}✅ Identity canister responding${NC}"
else
    echo -e "${YELLOW}⚠️  Identity canister test failed${NC}"
fi

echo ""

# Test Price Monitor canister
echo -e "${CYAN}📊 Testing Price Monitor canister...${NC}"
if dfx canister call btcminer_price_monitor getSupportedChains --network "$NETWORK"; then
    echo -e "${GREEN}✅ Price Monitor canister responding${NC}"
else
    echo -e "${YELLOW}⚠️  Price Monitor canister test failed${NC}"
fi

echo ""

# Test Liquidity Health canister
echo -e "${CYAN}💧 Testing Liquidity Health canister...${NC}"
if dfx canister call btcminer_liquidity_health getSupportedChains --network "$NETWORK"; then
    echo -e "${GREEN}✅ Liquidity Health canister responding${NC}"
else
    echo -e "${YELLOW}⚠️  Liquidity Health canister test failed${NC}"
fi

echo ""

# Generate deployment report
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
REPORT_FILE="../deployments/icp-deployment-$(date +%s).json"

cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "network": "$NETWORK",
  "canisters": {
    "btcminer_identity": {
      "canister_id": "$IDENTITY_CANISTER_ID",
      "status": "deployed",
      "type": "Digital Identity"
    },
    "btcminer_price_monitor": {
      "canister_id": "$PRICE_CANISTER_ID", 
      "status": "deployed",
      "type": "Price Monitor"
    },
    "btcminer_liquidity_health": {
      "canister_id": "$LIQUIDITY_CANISTER_ID",
      "status": "deployed", 
      "type": "Liquidity Health"
    }
  },
  "deployment_summary": {
    "total_canisters": 3,
    "successful_deployments": 3,
    "failed_deployments": 0,
    "success_rate": "100%"
  }
}
EOF

echo -e "${GREEN}💾 Deployment report saved to: $REPORT_FILE${NC}"

# Display summary
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   🎉 DEPLOYMENT COMPLETE                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ All BTCMiner ICP canisters deployed successfully!${NC}"
echo ""
echo -e "${CYAN}📋 Deployment Summary:${NC}"
echo -e "   Network: $NETWORK"
echo -e "   Digital Identity: $IDENTITY_CANISTER_ID"
echo -e "   Price Monitor: $PRICE_CANISTER_ID"
echo -e "   Liquidity Health: $LIQUIDITY_CANISTER_ID"
echo ""

# Display next steps
echo -e "${PURPLE}🎯 Next Steps:${NC}"
echo -e "1. Test canister functionality: ${YELLOW}./scripts/test-icp-canisters.sh${NC}"
echo -e "2. Link wallets to identity: ${YELLOW}dfx canister call btcminer_identity linkWallet${NC}"
echo -e "3. Update prices: ${YELLOW}dfx canister call btcminer_price_monitor updatePrice${NC}"
echo -e "4. Monitor liquidity: ${YELLOW}dfx canister call btcminer_liquidity_health updateLiquidityStatus${NC}"
echo ""

# Display useful commands
echo -e "${PURPLE}🔧 Useful Commands:${NC}"
echo -e "# Check canister status"
echo -e "${YELLOW}dfx canister status --all --network $NETWORK${NC}"
echo ""
echo -e "# View canister logs"
echo -e "${YELLOW}dfx canister logs btcminer_identity --network $NETWORK${NC}"
echo ""
echo -e "# Stop local replica (if running locally)"
if [ "$NETWORK" = "local" ]; then
    echo -e "${YELLOW}dfx stop${NC}"
fi
echo ""

# Display web interfaces (if local)
if [ "$NETWORK" = "local" ]; then
    echo -e "${PURPLE}🌐 Web Interfaces:${NC}"
    echo -e "Candid UI: ${CYAN}http://localhost:4943/?canisterId=$(dfx canister id __Candid_UI --network local)${NC}"
    echo ""
fi

echo -e "${GREEN}🎉 BTCMiner ICP deployment completed successfully!${NC}"

# Return to original directory
cd ..

exit 0