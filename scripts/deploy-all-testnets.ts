import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

interface DeploymentResult {
  network: string;
  success: boolean;
  contractAddress?: string;
  error?: string;
  gasUsed?: string;
  txHash?: string;
}

const TESTNET_NETWORKS = [
  "sepolia",      // Ethereum Sepolia
  "bscTestnet",   // BNB Chain Testnet
  "baseSepolia"   // Base Sepolia
];

async function deployToNetwork(network: string): Promise<DeploymentResult> {
  console.log(`\n🚀 Deploying to ${network}...`);
  console.log("=".repeat(40));
  
  try {
    const { stdout, stderr } = await execAsync(
      `npx hardhat run scripts/deploy-testnet.ts --network ${network}`,
      { timeout: 300000 } // 5 minute timeout
    );
    
    console.log(stdout);
    if (stderr) {
      console.warn("Warnings:", stderr);
    }
    
    // Parse deployment info from the deployments file
    const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);
    if (fs.existsSync(deploymentFile)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
      
      return {
        network,
        success: true,
        contractAddress: deploymentInfo.contractAddress,
        gasUsed: deploymentInfo.gasUsed,
        txHash: deploymentInfo.deploymentTx
      };
    } else {
      throw new Error("Deployment file not created");
    }
    
  } catch (error) {
    console.error(`❌ Deployment to ${network} failed:`, error);
    return {
      network,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function setupTrustedRemotesForNetwork(network: string): Promise<boolean> {
  console.log(`\n🔗 Setting up trusted remotes for ${network}...`);
  
  try {
    const { stdout, stderr } = await execAsync(
      `npx hardhat run scripts/setup-trusted-remotes.ts --network ${network}`,
      { timeout: 180000 } // 3 minute timeout
    );
    
    console.log(stdout);
    if (stderr) {
      console.warn("Warnings:", stderr);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Trusted remote setup failed for ${network}:`, error);
    return false;
  }
}

async function main() {
  console.log("🌐 BTCMiner Multi-Testnet Deployment");
  console.log("====================================");
  console.log(`📋 Networks to deploy: ${TESTNET_NETWORKS.join(", ")}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  const results: DeploymentResult[] = [];
  
  // Phase 1: Deploy to all networks
  console.log("\n📦 PHASE 1: Deploying contracts to all testnets");
  console.log("=".repeat(50));
  
  for (const network of TESTNET_NETWORKS) {
    const result = await deployToNetwork(network);
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
  
  console.log("\n📊 DEPLOYMENT SUMMARY");
  console.log("=".repeat(30));
  console.log(`✅ Successful: ${successfulDeployments.length}/${TESTNET_NETWORKS.length}`);
  console.log(`❌ Failed: ${failedDeployments.length}/${TESTNET_NETWORKS.length}`);
  
  if (successfulDeployments.length > 0) {
    console.log("\n✅ Successful Deployments:");
    successfulDeployments.forEach(result => {
      console.log(`  ${result.network}: ${result.contractAddress}`);
      console.log(`    Gas Used: ${result.gasUsed}`);
      console.log(`    Tx Hash: ${result.txHash}`);
    });
  }
  
  if (failedDeployments.length > 0) {
    console.log("\n❌ Failed Deployments:");
    failedDeployments.forEach(result => {
      console.log(`  ${result.network}: ${result.error}`);
    });
  }
  
  // Phase 2: Set up trusted remotes (only if we have multiple successful deployments)
  if (successfulDeployments.length > 1) {
    console.log("\n🔗 PHASE 2: Setting up trusted remotes");
    console.log("=".repeat(40));
    
    const trustedRemoteResults: Record<string, boolean> = {};
    
    for (const result of successfulDeployments) {
      const success = await setupTrustedRemotesForNetwork(result.network);
      trustedRemoteResults[result.network] = success;
      
      // Wait between setups
      if (successfulDeployments.indexOf(result) < successfulDeployments.length - 1) {
        console.log("⏳ Waiting 5 seconds before next setup...");
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log("\n📊 TRUSTED REMOTE SETUP SUMMARY");
    console.log("=".repeat(35));
    Object.entries(trustedRemoteResults).forEach(([network, success]) => {
      console.log(`  ${network}: ${success ? "✅ Success" : "❌ Failed"}`);
    });
  } else {
    console.log("\n⚠️  Skipping trusted remote setup (need at least 2 successful deployments)");
  }
  
  // Phase 3: Generate deployment report
  console.log("\n📋 FINAL REPORT");
  console.log("=".repeat(20));
  
  const reportFile = path.join(__dirname, "..", "deployments", `multi-testnet-report-${Date.now()}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    networks: TESTNET_NETWORKS,
    deployments: results,
    summary: {
      total: TESTNET_NETWORKS.length,
      successful: successfulDeployments.length,
      failed: failedDeployments.length,
      successRate: `${((successfulDeployments.length / TESTNET_NETWORKS.length) * 100).toFixed(1)}%`
    }
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportFile}`);
  
  // Next steps
  console.log("\n🎯 NEXT STEPS:");
  console.log("1. Verify contracts on block explorers");
  console.log("2. Test cross-chain transfers");
  console.log("3. Monitor gas costs and transaction success rates");
  console.log("4. Proceed with Solana deployment (Task 1.4)");
  
  if (successfulDeployments.length > 0) {
    console.log("\n🔍 VERIFICATION COMMANDS:");
    successfulDeployments.forEach(result => {
      console.log(`# ${result.network}`);
      console.log(`npx hardhat verify --network ${result.network} ${result.contractAddress} "ENDPOINT_ADDRESS" "BTCMiner" "BTCM"`);
    });
  }
  
  console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
  
  // Exit with appropriate code
  process.exit(failedDeployments.length > 0 ? 1 : 0);
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Multi-testnet deployment failed:", error);
    process.exit(1);
  });
}

export { main as deployAllTestnets };