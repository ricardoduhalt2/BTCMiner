import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface BridgeDeployment {
  network: string;
  chainId: number;
  wormholeChainId: number;
  bridgeAddress: string;
  btcMinerAddress: string;
  wormholeCoreAddress: string;
}

interface TestResult {
  test: string;
  network: string;
  success: boolean;
  result?: any;
  error?: string;
  txHash?: string;
  gasUsed?: string;
}

async function main() {
  console.log("🧪 BTCMiner Wormhole Bridge Testing");
  console.log("===================================");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  
  console.log(`📍 Testing Network: ${networkName}`);
  console.log(`👤 Tester: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  
  // Load bridge deployment information
  const bridgeDeploymentsFile = path.join(__dirname, "..", "deployments", "wormhole-bridges", "all-bridges.json");
  if (!fs.existsSync(bridgeDeploymentsFile)) {
    throw new Error("Bridge deployments not found. Deploy Wormhole bridges first.");
  }
  
  const bridgeDeployments: Record<string, BridgeDeployment> = JSON.parse(
    fs.readFileSync(bridgeDeploymentsFile, "utf8")
  );
  
  const currentDeployment = bridgeDeployments[networkName];
  if (!currentDeployment) {
    throw new Error(`No bridge deployment found for network: ${networkName}`);
  }
  
  // Connect to contracts
  const WormholeBridge = await ethers.getContractFactory("WormholeBridge");
  const wormholeBridge = WormholeBridge.attach(currentDeployment.bridgeAddress);
  
  const BTCMiner = await ethers.getContractFactory("BTCMiner");
  const btcMiner = BTCMiner.attach(currentDeployment.btcMinerAddress);
  
  console.log(`🔌 Connected to WormholeBridge at: ${currentDeployment.bridgeAddress}`);
  console.log(`🪙 Connected to BTCMiner at: ${currentDeployment.btcMinerAddress}`);
  
  const testResults: TestResult[] = [];
  
  // Test 1: Basic bridge functionality
  console.log("\n🔍 Test 1: Basic Bridge Functionality");
  console.log("-".repeat(40));
  
  try {
    const bridgeWormhole = await wormholeBridge.wormhole();
    const bridgeBTCMiner = await wormholeBridge.btcMiner();
    const bridgeChainId = await wormholeBridge.chainId();
    const messageFee = await wormholeBridge.getMessageFee();
    const [totalBridged, totalReceived] = await wormholeBridge.getBridgeStats();
    
    console.log(`✅ Wormhole Core: ${bridgeWormhole}`);
    console.log(`✅ BTCMiner Token: ${bridgeBTCMiner}`);
    console.log(`✅ Chain ID: ${bridgeChainId}`);
    console.log(`✅ Message Fee: ${ethers.formatEther(messageFee)} ETH`);
    console.log(`✅ Total Bridged: ${ethers.formatEther(totalBridged)} BTCM`);
    console.log(`✅ Total Received: ${ethers.formatEther(totalReceived)} BTCM`);
    
    testResults.push({
      test: "Basic Bridge Functionality",
      network: networkName,
      success: true,
      result: {
        wormholeCore: bridgeWormhole,
        btcMinerToken: bridgeBTCMiner,
        chainId: bridgeChainId.toString(),
        messageFee: messageFee.toString(),
        totalBridged: totalBridged.toString(),
        totalReceived: totalReceived.toString()
      }
    });
    
  } catch (error) {
    console.error("❌ Basic functionality test failed:", error);
    testResults.push({
      test: "Basic Bridge Functionality",
      network: networkName,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  // Test 2: Trusted emitter verification
  console.log("\n🔗 Test 2: Trusted Emitter Verification");
  console.log("-".repeat(40));
  
  const otherNetworks = Object.entries(bridgeDeployments).filter(([network]) => network !== networkName);
  
  for (const [remoteNetwork, remoteDeployment] of otherNetworks) {
    try {
      const trustedEmitter = await wormholeBridge.getTrustedEmitter(remoteDeployment.wormholeChainId);
      
      if (trustedEmitter !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log(`✅ ${remoteNetwork}: Trusted emitter configured`);
        console.log(`   Emitter: ${trustedEmitter}`);
        
        testResults.push({
          test: `Trusted Emitter - ${remoteNetwork}`,
          network: networkName,
          success: true,
          result: { trustedEmitter, targetNetwork: remoteNetwork }
        });
      } else {
        console.log(`⚠️  ${remoteNetwork}: No trusted emitter configured`);
        testResults.push({
          test: `Trusted Emitter - ${remoteNetwork}`,
          network: networkName,
          success: false,
          error: "No trusted emitter configured"
        });
      }
      
    } catch (error) {
      console.error(`❌ Trusted emitter check failed for ${remoteNetwork}:`, error);
      testResults.push({
        test: `Trusted Emitter - ${remoteNetwork}`,
        network: networkName,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Test 3: Token approval and balance check
  console.log("\n💰 Test 3: Token Balance and Approval");
  console.log("-".repeat(40));
  
  try {
    const userBalance = await btcMiner.balanceOf(deployer.address);
    const bridgeAllowance = await btcMiner.allowance(deployer.address, currentDeployment.bridgeAddress);
    const userDailyBurn = await btcMiner.getRemainingDailyBurn(deployer.address);
    
    console.log(`✅ User Balance: ${ethers.formatEther(userBalance)} BTCM`);
    console.log(`✅ Bridge Allowance: ${ethers.formatEther(bridgeAllowance)} BTCM`);
    console.log(`✅ Remaining Daily Burn: ${ethers.formatEther(userDailyBurn)} BTCM`);
    
    // Approve bridge if needed
    if (bridgeAllowance < ethers.parseEther("1000")) {
      console.log("🔧 Approving bridge for token spending...");
      const approveTx = await btcMiner.approve(currentDeployment.bridgeAddress, ethers.parseEther("1000000"));
      await approveTx.wait();
      console.log(`✅ Approval transaction: ${approveTx.hash}`);
    }
    
    testResults.push({
      test: "Token Balance and Approval",
      network: networkName,
      success: true,
      result: {
        userBalance: userBalance.toString(),
        bridgeAllowance: bridgeAllowance.toString(),
        remainingDailyBurn: userDailyBurn.toString()
      }
    });
    
  } catch (error) {
    console.error("❌ Token balance/approval test failed:", error);
    testResults.push({
      test: "Token Balance and Approval",
      network: networkName,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  // Test 4: Cross-chain transfer simulation (dry run)
  console.log("\n🌉 Test 4: Cross-Chain Transfer Simulation");
  console.log("-".repeat(45));
  
  if (otherNetworks.length > 0) {
    const [targetNetwork, targetDeployment] = otherNetworks[0];
    
    try {
      const transferAmount = ethers.parseEther("100"); // 100 BTCM
      const messageFee = await wormholeBridge.getMessageFee();
      
      console.log(`🎯 Target: ${targetNetwork} (Chain ID: ${targetDeployment.wormholeChainId})`);
      console.log(`💎 Amount: ${ethers.formatEther(transferAmount)} BTCM`);
      console.log(`💰 Message Fee: ${ethers.formatEther(messageFee)} ETH`);
      
      // Check if we have enough ETH for the message fee
      const userBalance = await ethers.provider.getBalance(deployer.address);
      if (userBalance < messageFee) {
        console.log(`⚠️  Insufficient ETH for message fee. Need ${ethers.formatEther(messageFee)} ETH`);
        testResults.push({
          test: "Cross-Chain Transfer Simulation",
          network: networkName,
          success: false,
          error: "Insufficient ETH for message fee"
        });
      } else {
        // Simulate the transfer (estimate gas)
        const gasEstimate = await wormholeBridge.sendTokens.estimateGas(
          transferAmount,
          targetDeployment.wormholeChainId,
          deployer.address,
          { value: messageFee }
        );
        
        console.log(`⛽ Estimated Gas: ${gasEstimate.toString()}`);
        console.log(`✅ Transfer simulation successful`);
        
        testResults.push({
          test: "Cross-Chain Transfer Simulation",
          network: networkName,
          success: true,
          result: {
            targetNetwork,
            targetChainId: targetDeployment.wormholeChainId,
            amount: transferAmount.toString(),
            messageFee: messageFee.toString(),
            gasEstimate: gasEstimate.toString()
          }
        });
      }
      
    } catch (error) {
      console.error("❌ Cross-chain transfer simulation failed:", error);
      testResults.push({
        test: "Cross-Chain Transfer Simulation",
        network: networkName,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } else {
    console.log("⚠️  No target networks available for testing");
  }
  
  // Test 5: Access control verification
  console.log("\n🔐 Test 5: Access Control");
  console.log("-".repeat(25));
  
  try {
    const DEFAULT_ADMIN_ROLE = await wormholeBridge.DEFAULT_ADMIN_ROLE();
    const BRIDGE_ROLE = await wormholeBridge.BRIDGE_ROLE();
    const RELAYER_ROLE = await wormholeBridge.RELAYER_ROLE();
    
    const hasAdminRole = await wormholeBridge.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasBridgeRole = await wormholeBridge.hasRole(BRIDGE_ROLE, deployer.address);
    const hasRelayerRole = await wormholeBridge.hasRole(RELAYER_ROLE, deployer.address);
    
    console.log(`✅ Admin Role: ${hasAdminRole ? "✓" : "✗"}`);
    console.log(`✅ Bridge Role: ${hasBridgeRole ? "✓" : "✗"}`);
    console.log(`✅ Relayer Role: ${hasRelayerRole ? "✓" : "✗"}`);
    
    testResults.push({
      test: "Access Control",
      network: networkName,
      success: true,
      result: { hasAdminRole, hasBridgeRole, hasRelayerRole }
    });
    
  } catch (error) {
    console.error("❌ Access control test failed:", error);
    testResults.push({
      test: "Access Control",
      network: networkName,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  // Test 6: Bridge funding check
  console.log("\n💳 Test 6: Bridge Funding");
  console.log("-".repeat(25));
  
  try {
    const bridgeBalance = await ethers.provider.getBalance(currentDeployment.bridgeAddress);
    const messageFee = await wormholeBridge.getMessageFee();
    const canSendMessage = bridgeBalance >= messageFee;
    
    console.log(`💰 Bridge Balance: ${ethers.formatEther(bridgeBalance)} ETH`);
    console.log(`💸 Message Fee: ${ethers.formatEther(messageFee)} ETH`);
    console.log(`✅ Can Send Messages: ${canSendMessage ? "Yes" : "No"}`);
    
    if (!canSendMessage) {
      console.log(`⚠️  Bridge needs funding. Send at least ${ethers.formatEther(messageFee)} ETH`);
    }
    
    testResults.push({
      test: "Bridge Funding",
      network: networkName,
      success: true,
      result: {
        bridgeBalance: bridgeBalance.toString(),
        messageFee: messageFee.toString(),
        canSendMessage
      }
    });
    
  } catch (error) {
    console.error("❌ Bridge funding test failed:", error);
    testResults.push({
      test: "Bridge Funding",
      network: networkName,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  // Generate test report
  console.log("\n📊 TEST SUMMARY");
  console.log("=".repeat(20));
  
  const successfulTests = testResults.filter(t => t.success);
  const failedTests = testResults.filter(t => !t.success);
  
  console.log(`✅ Passed: ${successfulTests.length}/${testResults.length}`);
  console.log(`❌ Failed: ${failedTests.length}/${testResults.length}`);
  console.log(`📈 Success Rate: ${((successfulTests.length / testResults.length) * 100).toFixed(1)}%`);
  
  if (failedTests.length > 0) {
    console.log("\n❌ Failed Tests:");
    failedTests.forEach(test => {
      console.log(`  ${test.test}: ${test.error}`);
    });
  }
  
  // Save test report
  const reportsDir = path.join(__dirname, "..", "test-reports", "wormhole");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportFile = path.join(reportsDir, `${networkName}-wormhole-test-${Date.now()}.json`);
  const report = {
    network: networkName,
    timestamp: new Date().toISOString(),
    bridgeAddress: currentDeployment.bridgeAddress,
    btcMinerAddress: currentDeployment.btcMinerAddress,
    tester: deployer.address,
    results: testResults,
    summary: {
      total: testResults.length,
      passed: successfulTests.length,
      failed: failedTests.length,
      successRate: `${((successfulTests.length / testResults.length) * 100).toFixed(1)}%`
    }
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Test report saved to: ${reportFile}`);
  
  // Recommendations
  console.log("\n💡 Recommendations:");
  console.log("===================");
  
  if (failedTests.some(t => t.test.includes("Trusted Emitter"))) {
    console.log("🔧 Configure trusted emitters: npx hardhat run scripts/setup-wormhole-emitters.ts");
  }
  
  if (failedTests.some(t => t.test.includes("Bridge Funding"))) {
    console.log(`💰 Fund bridge contract: Send ETH to ${currentDeployment.bridgeAddress}`);
  }
  
  if (successfulTests.length === testResults.length) {
    console.log("🎉 All tests passed! Bridge is ready for cross-chain transfers.");
    console.log("🚀 Try a real cross-chain transfer with small amounts first.");
  }
  
  return testResults;
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Wormhole bridge testing failed:", error);
      process.exit(1);
    });
}

export { main as testWormholeBridge };