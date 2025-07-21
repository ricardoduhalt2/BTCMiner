import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

interface BridgeDeploymentResult {
  network: string;
  success: boolean;
  bridgeAddress?: string;
  btcMinerAddress?: string;
  error?: string;
  gasUsed?: string;
  txHash?: string;
}

const TESTNET_NETWORKS = [
  "sepolia",      // Ethereum Sepolia
  "bscTestnet",   // BNB Chain Testnet
  "baseSepolia"   // Base Sepolia
];

async function deployBridgeToNetwork(network: string): Promise<BridgeDeploymentResult> {
  console.log(`\n🌉 Deploying Wormhole Bridge to ${network}...`);
  console.log("=".repeat(50));
  
  try {
    const { stdout, stderr } = await execAsync(
      `npx hardhat run scripts/deploy-wormhole-bridge.ts --network ${network}`,
      { timeout: 300000 } // 5 minute timeout
    );
    
    console.log(stdout);
    if (stderr) {
      console.warn("Warnings:", stderr);
    }
    
    // Parse deployment info from the bridge deployments file
    const deploymentFile = path.join(__dirname, "..", "deployments", "wormhole-bridges", `${network}-bridge.json`);
    if (fs.existsSync(deploymentFile)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
      
      return {
        network,
        success: true,
        bridgeAddress: deploymentInfo.bridgeAddress,
        btcMinerAddress: deploymentInfo.btcMinerAddress,
        gasUsed: deploymentInfo.gasUsed,
        txHash: deploymentInfo.deploymentTx
      };
    } else {
      throw new Error("Bridge deployment file not created");
    }
    
  } catch (error) {
    console.error(`❌ Bridge deployment to ${network} failed:`, error);
    return {
      network,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function setupEmittersForNetwork(network: string): Promise<boolean> {
  console.log(`\n🔗 Setting up emitters for ${network}...`);
  
  try {
    const { stdout, stderr } = await execAsync(
      `npx hardhat run scripts/setup-wormhole-emitters.ts --network ${network}`,
      { timeout: 180000 } // 3 minute timeout
    );
    
    console.log(stdout);
    if (stderr) {
      console.warn("Warnings:", stderr);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Emitter setup failed for ${network}:`, error);
    return false;
  }
}

async function main() {
  console.log("🌉 BTCMiner Wormhole Bridge Multi-Network Deployment");
  console.log("====================================================");
  console.log(`📋 Networks to deploy: ${TESTNET_NETWORKS.join(", ")}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  // Check if BTCMiner contracts are deployed
  const btcMinerDeploymentsFile = path.join(__dirname, "..", "deployments", "testnet-deployments.json");
  if (!fs.existsSync(btcMinerDeploymentsFile)) {
    console.error("❌ BTCMiner contracts not found. Deploy BTCMiner contracts first:");
    console.error("   npx hardhat run scripts/deploy-all-testnets.ts");
    process.exit(1);
  }
  
  const btcMinerDeployments = JSON.parse(fs.readFileSync(btcMinerDeploymentsFile, "utf8"));
  console.log("\n📋 Found BTCMiner Deployments:");
  Object.entries(btcMinerDeployments).forEach(([network, info]: [string, any]) => {
    console.log(`  ${network}: ${info.contractAddress}`);
  });
  
  const results: BridgeDeploymentResult[] = [];
  
  // Phase 1: Deploy bridges to all networks
  console.log("\n🌉 PHASE 1: Deploying Wormhole bridges to all testnets");
  console.log("=".repeat(60));
  
  for (const network of TESTNET_NETWORKS) {
    // Check if BTCMiner is deployed on this network
    if (!btcMinerDeployments[network]) {
      console.log(`⚠️  Skipping ${network}: BTCMiner not deployed`);
      results.push({
        network,
        success: false,
        error: "BTCMiner not deployed on this network"
      });
      continue;
    }
    
    const result = await deployBridgeToNetwork(network);
    results.push(result);
    
    // Wait a bit between deployments to avoid rate limiting
    if (TESTNET_NETWORKS.indexOf(network) < TESTNET_NETWORKS.length - 1) {
      console.log("⏳ Waiting 10 seconds before next deployment...");
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  // Check deployment results
  const successfulDeployments = results.filter(r => r.success);
  const failedDeployments = results.filter(r => !r.success);
  
  console.log("\n📊 BRIDGE DEPLOYMENT SUMMARY");
  console.log("=".repeat(35));
  console.log(`✅ Successful: ${successfulDeployments.length}/${TESTNET_NETWORKS.length}`);
  console.log(`❌ Failed: ${failedDeployments.length}/${TESTNET_NETWORKS.length}`);
  
  if (successfulDeployments.length > 0) {
    console.log("\n✅ Successful Bridge Deployments:");
    successfulDeployments.forEach(result => {
      console.log(`  ${result.network}:`);
      console.log(`    Bridge: ${result.bridgeAddress}`);
      console.log(`    BTCMiner: ${result.btcMinerAddress}`);
      console.log(`    Gas Used: ${result.gasUsed}`);
      console.log(`    Tx Hash: ${result.txHash}`);
    });
  }
  
  if (failedDeployments.length > 0) {
    console.log("\n❌ Failed Bridge Deployments:");
    failedDeployments.forEach(result => {
      console.log(`  ${result.network}: ${result.error}`);
    });
  }
  
  // Phase 2: Set up trusted emitters (only if we have multiple successful deployments)
  if (successfulDeployments.length > 1) {
    console.log("\n🔗 PHASE 2: Setting up trusted emitters");
    console.log("=".repeat(45));
    
    const emitterResults: Record<string, boolean> = {};
    
    for (const result of successfulDeployments) {
      const success = await setupEmittersForNetwork(result.network);
      emitterResults[result.network] = success;
      
      // Wait between setups
      if (successfulDeployments.indexOf(result) < successfulDeployments.length - 1) {
        console.log("⏳ Waiting 5 seconds before next setup...");
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log("\n📊 EMITTER SETUP SUMMARY");
    console.log("=".repeat(30));
    Object.entries(emitterResults).forEach(([network, success]) => {
      console.log(`  ${network}: ${success ? "✅ Success" : "❌ Failed"}`);
    });
  } else {
    console.log("\n⚠️  Skipping emitter setup (need at least 2 successful deployments)");
  }
  
  // Phase 3: Generate comprehensive report
  console.log("\n📋 FINAL WORMHOLE BRIDGE REPORT");
  console.log("=".repeat(35));
  
  const reportFile = path.join(__dirname, "..", "deployments", "wormhole-bridges", `multi-bridge-report-${Date.now()}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    networks: TESTNET_NETWORKS,
    bridgeDeployments: results,
    btcMinerDeployments: Object.keys(btcMinerDeployments),
    summary: {
      total: TESTNET_NETWORKS.length,
      successful: successfulDeployments.length,
      failed: failedDeployments.length,
      successRate: `${((successfulDeployments.length / TESTNET_NETWORKS.length) * 100).toFixed(1)}%`
    },
    integration: {
      layerZeroOFT: "✅ Deployed",
      wormholeBridges: successfulDeployments.length > 0 ? "✅ Deployed" : "❌ Failed",
      crossChainReady: successfulDeployments.length > 1 ? "✅ Ready" : "⚠️ Partial"
    }
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportFile}`);
  
  // Integration status
  console.log("\n🔗 CROSS-CHAIN INTEGRATION STATUS");
  console.log("=".repeat(40));
  console.log(`LayerZero OFT: ✅ Deployed on ${Object.keys(btcMinerDeployments).length} networks`);
  console.log(`Wormhole Bridges: ${successfulDeployments.length > 0 ? "✅" : "❌"} Deployed on ${successfulDeployments.length} networks`);
  console.log(`Cross-Chain Ready: ${successfulDeployments.length > 1 ? "✅" : "⚠️"} ${successfulDeployments.length > 1 ? "Yes" : "Partial"}`);
  
  // Next steps
  console.log("\n🎯 NEXT STEPS:");
  console.log("==============");
  
  if (successfulDeployments.length > 1) {
    console.log("✅ Bridges deployed and configured!");
    console.log("1. Test cross-chain transfers between networks");
    console.log("2. Fund bridges with ETH for message fees");
    console.log("3. Set up automated relayers");
    console.log("4. Deploy ICP canisters (Task 1.6)");
    console.log("5. Integrate Solana with Wormhole");
  } else if (successfulDeployments.length === 1) {
    console.log("⚠️  Only one bridge deployed. Deploy to more networks for cross-chain functionality.");
    console.log("1. Fix failed deployments");
    console.log("2. Deploy to additional networks");
    console.log("3. Configure trusted emitters");
  } else {
    console.log("❌ No bridges deployed successfully.");
    console.log("1. Check network configurations");
    console.log("2. Ensure sufficient funds for deployment");
    console.log("3. Verify BTCMiner contracts are deployed");
  }
  
  console.log("\n🧪 TESTING COMMANDS:");
  if (successfulDeployments.length > 0) {
    console.log("# Test individual bridges");
    successfulDeployments.forEach(result => {
      console.log(`npx hardhat run scripts/test-wormhole-transfer.ts --network ${result.network}`);
    });
    
    console.log("\n# Verify bridge contracts");
    successfulDeployments.forEach(result => {
      console.log(`# ${result.network}`);
      console.log(`npx hardhat verify --network ${result.network} ${result.bridgeAddress} WORMHOLE_CORE BTCMiner_ADDRESS CHAIN_ID`);
    });
  }
  
  console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
  
  // Exit with appropriate code
  process.exit(failedDeployments.length > 0 ? 1 : 0);
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Multi-bridge deployment failed:", error);
    process.exit(1);
  });
}

export { main as deployAllWormholeBridges };