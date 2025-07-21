import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  lzChainId: number;
  contractAddress: string;
  deploymentTx: string;
  deployer: string;
  gasUsed: string;
  timestamp: number;
}

interface TestResult {
  test: string;
  network: string;
  success: boolean;
  result?: any;
  error?: string;
  gasUsed?: string;
}

async function main() {
  console.log("🧪 BTCMiner Cross-Chain Functionality Tests");
  console.log("==========================================");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  
  console.log(`📍 Testing Network: ${networkName}`);
  console.log(`👤 Tester: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  
  // Load deployment information
  const deploymentsFile = path.join(__dirname, "..", "deployments", "testnet-deployments.json");
  if (!fs.existsSync(deploymentsFile)) {
    throw new Error("Deployment file not found. Please deploy contracts first.");
  }
  
  const deployments: Record<string, DeploymentInfo> = JSON.parse(
    fs.readFileSync(deploymentsFile, "utf8")
  );
  
  const currentDeployment = deployments[networkName];
  if (!currentDeployment) {
    throw new Error(`No deployment found for network: ${networkName}`);
  }
  
  // Connect to the deployed contract
  const BTCMiner = await ethers.getContractFactory("BTCMiner");
  const btcMiner = BTCMiner.attach(currentDeployment.contractAddress);
  
  console.log(`🔌 Connected to BTCMiner at: ${currentDeployment.contractAddress}`);
  
  const testResults: TestResult[] = [];
  
  // Test 1: Basic contract functionality
  console.log("\n🔍 Test 1: Basic Contract Functionality");
  console.log("-".repeat(40));
  
  try {
    const name = await btcMiner.name();
    const symbol = await btcMiner.symbol();
    const totalSupply = await btcMiner.totalSupply();
    const balance = await btcMiner.balanceOf(deployer.address);
    const lzEndpoint = await btcMiner.lzEndpoint();
    
    console.log(`✅ Token Name: ${name}`);
    console.log(`✅ Token Symbol: ${symbol}`);
    console.log(`✅ Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    console.log(`✅ Deployer Balance: ${ethers.formatEther(balance)} ${symbol}`);
    console.log(`✅ LayerZero Endpoint: ${lzEndpoint}`);
    
    testResults.push({
      test: "Basic Functionality",
      network: networkName,
      success: true,
      result: { name, symbol, totalSupply: totalSupply.toString(), balance: balance.toString() }
    });
    
  } catch (error) {
    console.error("❌ Basic functionality test failed:", error);
    testResults.push({
      test: "Basic Functionality",
      network: networkName,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  // Test 2: Daily burn limit functionality
  console.log("\n🔥 Test 2: Daily Burn Limit");
  console.log("-".repeat(30));
  
  try {
    const remainingBurn = await btcMiner.getRemainingDailyBurn(deployer.address);
    const maxDailyBurn = await btcMiner.MAX_DAILY_BURN();
    
    console.log(`✅ Max Daily Burn: ${ethers.formatEther(maxDailyBurn)} BTCM`);
    console.log(`✅ Remaining Daily Burn: ${ethers.formatEther(remainingBurn)} BTCM`);
    
    // Test small burn
    const burnAmount = ethers.parseEther("100"); // 100 tokens
    const tx = await btcMiner.burn(burnAmount);
    const receipt = await tx.wait();
    
    console.log(`✅ Burned ${ethers.formatEther(burnAmount)} BTCM`);
    console.log(`⛽ Gas Used: ${receipt?.gasUsed}`);
    
    const newRemainingBurn = await btcMiner.getRemainingDailyBurn(deployer.address);
    console.log(`✅ New Remaining Daily Burn: ${ethers.formatEther(newRemainingBurn)} BTCM`);
    
    testResults.push({
      test: "Daily Burn Limit",
      network: networkName,
      success: true,
      result: { 
        maxDailyBurn: maxDailyBurn.toString(), 
        burnedAmount: burnAmount.toString(),
        gasUsed: receipt?.gasUsed.toString()
      }
    });
    
  } catch (error) {
    console.error("❌ Daily burn limit test failed:", error);
    testResults.push({
      test: "Daily Burn Limit",
      network: networkName,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  // Test 3: Cross-chain gas estimation
  console.log("\n⛽ Test 3: Cross-Chain Gas Estimation");
  console.log("-".repeat(40));
  
  const otherNetworks = Object.entries(deployments).filter(([network]) => network !== networkName);
  
  for (const [remoteNetwork, remoteDeployment] of otherNetworks) {
    try {
      const testAmount = ethers.parseEther("100"); // 100 tokens
      const adapterParams = "0x00010000000000000000000000000000000000000000000000000000000000030d40"; // 200k gas
      
      const [nativeFee, zroFee] = await btcMiner.estimateSendFee(
        remoteDeployment.lzChainId,
        deployer.address,
        testAmount,
        false,
        adapterParams
      );
      
      console.log(`✅ ${remoteNetwork} (LZ Chain ${remoteDeployment.lzChainId}):`);
      console.log(`   Native Fee: ${ethers.formatEther(nativeFee)} ETH`);
      console.log(`   ZRO Fee: ${ethers.formatEther(zroFee)} ZRO`);
      
      testResults.push({
        test: `Gas Estimation - ${remoteNetwork}`,
        network: networkName,
        success: true,
        result: { 
          nativeFee: nativeFee.toString(), 
          zroFee: zroFee.toString(),
          targetNetwork: remoteNetwork,
          targetLzChainId: remoteDeployment.lzChainId
        }
      });
      
    } catch (error) {
      console.error(`❌ Gas estimation failed for ${remoteNetwork}:`, error);
      testResults.push({
        test: `Gas Estimation - ${remoteNetwork}`,
        network: networkName,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Test 4: Trusted remote verification
  console.log("\n🔗 Test 4: Trusted Remote Verification");
  console.log("-".repeat(40));
  
  for (const [remoteNetwork, remoteDeployment] of otherNetworks) {
    try {
      const trustedRemote = await btcMiner.trustedRemoteLookup(remoteDeployment.lzChainId);
      
      if (trustedRemote && trustedRemote !== "0x") {
        console.log(`✅ ${remoteNetwork}: Trusted remote configured`);
        console.log(`   Path: ${trustedRemote}`);
        
        testResults.push({
          test: `Trusted Remote - ${remoteNetwork}`,
          network: networkName,
          success: true,
          result: { trustedRemote, targetNetwork: remoteNetwork }
        });
      } else {
        console.log(`⚠️  ${remoteNetwork}: No trusted remote configured`);
        testResults.push({
          test: `Trusted Remote - ${remoteNetwork}`,
          network: networkName,
          success: false,
          error: "No trusted remote configured"
        });
      }
      
    } catch (error) {
      console.error(`❌ Trusted remote check failed for ${remoteNetwork}:`, error);
      testResults.push({
        test: `Trusted Remote - ${remoteNetwork}`,
        network: networkName,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Test 5: Access control verification
  console.log("\n🔐 Test 5: Access Control");
  console.log("-".repeat(25));
  
  try {
    const adminRole = await btcMiner.ADMIN_ROLE();
    const pauserRole = await btcMiner.PAUSER_ROLE();
    const routerRole = await btcMiner.ROUTER_ROLE();
    
    const hasAdminRole = await btcMiner.hasRole(adminRole, deployer.address);
    const hasPauserRole = await btcMiner.hasRole(pauserRole, deployer.address);
    
    console.log(`✅ Admin Role: ${hasAdminRole ? "✓" : "✗"}`);
    console.log(`✅ Pauser Role: ${hasPauserRole ? "✓" : "✗"}`);
    console.log(`✅ Router Role Hash: ${routerRole}`);
    
    testResults.push({
      test: "Access Control",
      network: networkName,
      success: true,
      result: { hasAdminRole, hasPauserRole, adminRole, pauserRole, routerRole }
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
  const reportsDir = path.join(__dirname, "..", "test-reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportFile = path.join(reportsDir, `${networkName}-test-report-${Date.now()}.json`);
  const report = {
    network: networkName,
    timestamp: new Date().toISOString(),
    contractAddress: currentDeployment.contractAddress,
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
  
  return testResults;
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Testing failed:", error);
      process.exit(1);
    });
}

export { main as testCrossChain };