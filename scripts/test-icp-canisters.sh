#!/bin/bash

# 🧪 BTCMiner ICP Canisters Testing Script
# Comprehensive testing of all ICP canisters

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
NETWORK="local"  # Change to "ic" for mainnet
TEST_RESULTS=()

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                🧪 BTCMiner ICP Testing Suite                 ║${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}║  Comprehensive testing of all ICP canisters                 ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Helper function to run test and record result
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_success="$3"  # true/false
    
    echo -e "${CYAN}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command" &> /dev/null; then
        if [ "$expected_success" = "true" ]; then
            echo -e "${GREEN}✅ PASS: $test_name${NC}"
            TEST_RESULTS+=("PASS: $test_name")
        else
            echo -e "${RED}❌ FAIL: $test_name (expected to fail but passed)${NC}"
            TEST_RESULTS+=("FAIL: $test_name")
        fi
    else
        if [ "$expected_success" = "false" ]; then
            echo -e "${GREEN}✅ PASS: $test_name (expected failure)${NC}"
            TEST_RESULTS+=("PASS: $test_name")
        else
            echo -e "${RED}❌ FAIL: $test_name${NC}"
            TEST_RESULTS+=("FAIL: $test_name")
        fi
    fi
    echo ""
}

# Navigate to ICP directory
cd "$ICP_DIR"

# Check if canisters are deployed
echo -e "${PURPLE}📋 Checking canister deployment status...${NC}"

if ! dfx canister status btcminer_identity --network "$NETWORK" &> /dev/null; then
    echo -e "${RED}❌ Error: Canisters not deployed. Run deploy-icp.sh first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All canisters are deployed${NC}"
echo ""

# Test 1: Digital Identity Canister Tests
echo -e "${PURPLE}🆔 DIGITAL IDENTITY CANISTER TESTS${NC}"
echo "=" $(printf '%.0s' {1..50})

# Test basic queries
run_test "Get supported chains" \
    "dfx canister call btcminer_identity getSupportedChains --network $NETWORK" \
    "true"

run_test "Get platform stats" \
    "dfx canister call btcminer_identity getStats --network $NETWORK" \
    "true"

# Test wallet linking
run_test "Link Ethereum wallet" \
    "dfx canister call btcminer_identity linkWallet '(record { address = \"0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b\"; chainId = 1; chainName = \"Ethereum\"; signature = \"test_signature\" })' --network $NETWORK" \
    "true"

run_test "Link BNB Chain wallet" \
    "dfx canister call btcminer_identity linkWallet '(record { address = \"0x123456789abcdef123456789abcdef123456789a\"; chainId = 56; chainName = \"BNB Chain\"; signature = \"test_signature\" })' --network $NETWORK" \
    "true"

run_test "Get my profile" \
    "dfx canister call btcminer_identity getMyProfile --network $NETWORK" \
    "true"

run_test "Get my wallets" \
    "dfx canister call btcminer_identity getMyWallets --network $NETWORK" \
    "true"

run_test "Set preferred chain" \
    "dfx canister call btcminer_identity setPreferredChain '(1)' --network $NETWORK" \
    "true"

# Test invalid operations
run_test "Link invalid wallet (should fail)" \
    "dfx canister call btcminer_identity linkWallet '(record { address = \"invalid\"; chainId = 999; chainName = \"Invalid\"; signature = \"test\" })' --network $NETWORK" \
    "false"

echo ""

# Test 2: Price Monitor Canister Tests
echo -e "${PURPLE}📊 PRICE MONITOR CANISTER TESTS${NC}"
echo "=" $(printf '%.0s' {1..50})

# Test basic queries
run_test "Get supported chains" \
    "dfx canister call btcminer_price_monitor getSupportedChains --network $NETWORK" \
    "true"

run_test "Get monitoring stats" \
    "dfx canister call btcminer_price_monitor getMonitoringStats --network $NETWORK" \
    "true"

# Test price updates
run_test "Update Ethereum price" \
    "dfx canister call btcminer_price_monitor updatePrice '(1, 1850.75, \"test_source\")' --network $NETWORK" \
    "true"

run_test "Update BNB Chain price" \
    "dfx canister call btcminer_price_monitor updatePrice '(56, 225.50, \"test_source\")' --network $NETWORK" \
    "true"

run_test "Update Base price" \
    "dfx canister call btcminer_price_monitor updatePrice '(8453, 1.25, \"test_source\")' --network $NETWORK" \
    "true"

run_test "Update Solana price (trigger deviation)" \
    "dfx canister call btcminer_price_monitor updatePrice '(1399811149, 95.30, \"test_source\")' --network $NETWORK" \
    "true"

# Test price queries
run_test "Get Ethereum price" \
    "dfx canister call btcminer_price_monitor getPrice '(1)' --network $NETWORK" \
    "true"

run_test "Get all prices" \
    "dfx canister call btcminer_price_monitor getAllPrices --network $NETWORK" \
    "true"

run_test "Get price statistics" \
    "dfx canister call btcminer_price_monitor getPriceStats --network $NETWORK" \
    "true"

run_test "Get recent alerts" \
    "dfx canister call btcminer_price_monitor getRecentAlerts '(5)' --network $NETWORK" \
    "true"

run_test "Check for active alerts" \
    "dfx canister call btcminer_price_monitor hasActiveAlerts --network $NETWORK" \
    "true"

# Test batch updates
run_test "Batch price update" \
    "dfx canister call btcminer_price_monitor updatePrices '(vec { record { 1; 1855.00; \"batch_test\" }; record { 56; 226.00; \"batch_test\" } })' --network $NETWORK" \
    "true"

# Test invalid operations
run_test "Update with negative price (should fail)" \
    "dfx canister call btcminer_price_monitor updatePrice '(1, -100.0, \"test\")' --network $NETWORK" \
    "false"

echo ""

# Test 3: Liquidity Health Canister Tests
echo -e "${PURPLE}💧 LIQUIDITY HEALTH CANISTER TESTS${NC}"
echo "=" $(printf '%.0s' {1..50})

# Test basic queries
run_test "Get supported chains" \
    "dfx canister call btcminer_liquidity_health getSupportedChains --network $NETWORK" \
    "true"

run_test "Get system stats" \
    "dfx canister call btcminer_liquidity_health getSystemStats --network $NETWORK" \
    "true"

# Test liquidity updates
run_test "Update Ethereum liquidity (normal)" \
    "dfx canister call btcminer_liquidity_health updateLiquidityStatus '(1, 1000000.0, 800000.0)' --network $NETWORK" \
    "true"

run_test "Update BNB Chain liquidity (low)" \
    "dfx canister call btcminer_liquidity_health updateLiquidityStatus '(56, 500000.0, 100000.0)' --network $NETWORK" \
    "true"

run_test "Update Base liquidity (critical)" \
    "dfx canister call btcminer_liquidity_health updateLiquidityStatus '(8453, 200000.0, 15000.0)' --network $NETWORK" \
    "true"

run_test "Update Solana liquidity (emergency)" \
    "dfx canister call btcminer_liquidity_health updateLiquidityStatus '(1399811149, 100000.0, 3000.0)' --network $NETWORK" \
    "true"

# Test liquidity queries
run_test "Get Ethereum liquidity status" \
    "dfx canister call btcminer_liquidity_health getLiquidityStatus '(1)' --network $NETWORK" \
    "true"

run_test "Get all liquidity status" \
    "dfx canister call btcminer_liquidity_health getAllLiquidityStatus --network $NETWORK" \
    "true"

run_test "Get critical chains" \
    "dfx canister call btcminer_liquidity_health getCriticalChains --network $NETWORK" \
    "true"

run_test "Get overall metrics" \
    "dfx canister call btcminer_liquidity_health getOverallMetrics --network $NETWORK" \
    "true"

run_test "Get recent alerts" \
    "dfx canister call btcminer_liquidity_health getRecentAlerts '(10)' --network $NETWORK" \
    "true"

# Test liquidity provider functions
run_test "Register as liquidity provider" \
    "dfx canister call btcminer_liquidity_health registerLiquidityProvider '(50000.0, vec { 1; 56 })' --network $NETWORK" \
    "true"

run_test "Get my provider info" \
    "dfx canister call btcminer_liquidity_health getMyProviderInfo --network $NETWORK" \
    "true"

run_test "Calculate rewards" \
    "dfx canister call btcminer_liquidity_health calculateRewards --network $NETWORK" \
    "true"

# Test invalid operations
run_test "Update with negative liquidity (should fail)" \
    "dfx canister call btcminer_liquidity_health updateLiquidityStatus '(1, -1000.0, 500.0)' --network $NETWORK" \
    "false"

run_test "Update with available > total (should fail)" \
    "dfx canister call btcminer_liquidity_health updateLiquidityStatus '(1, 1000.0, 1500.0)' --network $NETWORK" \
    "false"

echo ""

# Test 4: Integration Tests
echo -e "${PURPLE}🔗 INTEGRATION TESTS${NC}"
echo "=" $(printf '%.0s' {1..50})

# Test cross-canister functionality
run_test "Record transaction in identity" \
    "dfx canister call btcminer_identity recordTransaction --network $NETWORK" \
    "true"

run_test "Start price monitoring" \
    "dfx canister call btcminer_price_monitor startPriceMonitoring --network $NETWORK" \
    "true"

# Test data consistency
run_test "Verify user profile after transaction" \
    "dfx canister call btcminer_identity getMyProfile --network $NETWORK" \
    "true"

run_test "Verify price alerts after updates" \
    "dfx canister call btcminer_price_monitor getRecentAlerts '(3)' --network $NETWORK" \
    "true"

run_test "Verify rebalance alerts after liquidity updates" \
    "dfx canister call btcminer_liquidity_health getRecentAlerts '(3)' --network $NETWORK" \
    "true"

echo ""

# Test 5: Performance Tests
echo -e "${PURPLE}⚡ PERFORMANCE TESTS${NC}"
echo "=" $(printf '%.0s' {1..50})

# Test multiple rapid updates
echo -e "${CYAN}🔍 Testing rapid price updates...${NC}"
for i in {1..5}; do
    price=$(echo "1800 + $i * 10" | bc -l)
    if dfx canister call btcminer_price_monitor updatePrice "(1, $price, \"perf_test_$i\")" --network "$NETWORK" &> /dev/null; then
        echo -e "${GREEN}✅ Rapid update $i successful${NC}"
    else
        echo -e "${RED}❌ Rapid update $i failed${NC}"
    fi
done

echo ""

# Generate test report
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
TOTAL_TESTS=${#TEST_RESULTS[@]}
PASSED_TESTS=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "PASS" || true)
FAILED_TESTS=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "FAIL" || true)
SUCCESS_RATE=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)

REPORT_FILE="../test-reports/icp-test-report-$(date +%s).json"
mkdir -p "../test-reports"

cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "network": "$NETWORK",
  "test_summary": {
    "total_tests": $TOTAL_TESTS,
    "passed_tests": $PASSED_TESTS,
    "failed_tests": $FAILED_TESTS,
    "success_rate": "${SUCCESS_RATE}%"
  },
  "test_categories": {
    "digital_identity": "completed",
    "price_monitor": "completed", 
    "liquidity_health": "completed",
    "integration": "completed",
    "performance": "completed"
  },
  "detailed_results": [
$(printf '    "%s"' "${TEST_RESULTS[@]}" | paste -sd ',' -)
  ]
}
EOF

echo -e "${GREEN}💾 Test report saved to: $REPORT_FILE${NC}"

# Display final results
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   📊 TEST RESULTS SUMMARY                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 Test Summary:${NC}"
echo -e "   Total Tests: $TOTAL_TESTS"
echo -e "   Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "   Failed: ${RED}$FAILED_TESTS${NC}"
echo -e "   Success Rate: ${GREEN}${SUCCESS_RATE}%${NC}"
echo ""

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! ICP canisters are working correctly.${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the detailed results above.${NC}"
    echo ""
    echo -e "${RED}Failed tests:${NC}"
    printf '%s\n' "${TEST_RESULTS[@]}" | grep "FAIL" | sed 's/^/   /'
fi

echo ""
echo -e "${PURPLE}🔧 Useful Commands:${NC}"
echo -e "# View canister logs"
echo -e "${YELLOW}dfx canister logs btcminer_identity --network $NETWORK${NC}"
echo ""
echo -e "# Check canister status"
echo -e "${YELLOW}dfx canister status --all --network $NETWORK${NC}"
echo ""
echo -e "# Interact with canisters via Candid UI"
if [ "$NETWORK" = "local" ]; then
    echo -e "${CYAN}http://localhost:4943/?canisterId=$(dfx canister id __Candid_UI --network local 2>/dev/null || echo 'CANDID_UI_ID')${NC}"
fi

echo ""
echo -e "${GREEN}🧪 ICP canister testing completed!${NC}"

# Return to original directory
cd ..

# Exit with appropriate code
if [ "$FAILED_TESTS" -eq 0 ]; then
    exit 0
else
    exit 1
fi