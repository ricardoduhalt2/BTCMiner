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

async function main() {
  console.log("🔗 BTCMiner Wormhole Emitter Configuration");
  console.log("==========================================");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  
  console.log(`📍 Current Network: ${networkName}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  
  // Load bridge deployment information
  const bridgeDeploymentsFile = path.join(__dirname, "..", "deployments", "wormhole-bridges", "all-bridges.json");
  if (!fs.existsSync(bridgeDeploymentsFile)) {
    throw new Error("Bridge deployments not found. Deploy Wormhole bridges first.");
  }
  
  const bridgeDeployments: Record<string, BridgeDeployment> = JSON.parse(
    fs.readFileSync(bridgeDeploymentsFile, "utf8")
  );
  
  console.log("\n📋 Available Bridge Deployments:");
  Object.entries(bridgeDeployments).forEach(([network, info]) => {
    console.log(`  ${network}: ${info.bridgeAddress} (Wormhole Chain ID: ${info.wormholeChainId})`);
  });
  
  // Get current network deployment
  const currentDeployment = bridgeDeployments[networkName];
  if (!currentDeployment) {
    throw new Error(`No bridge deployment found for network: ${networkName}`);
  }
  
  // Connect to the deployed bridge
  const WormholeBridge = await ethers.getContractFactory("WormholeBridge");
  const wormholeBridge = WormholeBridge.attach(currentDeployment.bridgeAddress);
  
  console.log(`\n🔌 Connected to WormholeBridge at: ${currentDeployment.bridgeAddress}`);
  
  // Set up trusted emitters for all other networks
  const otherNetworks = Object.entries(bridgeDeployments).filter(([network]) => network !== networkName);
  
  if (otherNetworks.length === 0) {
    console.log("⚠️  No other networks found. Deploy bridges to additional networks first.");
    return;
  }
  
  console.log(`\n🔧 Setting up trusted emitters for ${otherNetworks.length} networks...`);
  
  const configurationResults: Array<{
    network: string;
    wormholeChainId: number;
    success: boolean;
    txHash?: string;
    error?: string;
  }> = [];
  
  for (const [remoteNetwork, remoteDeployment] of otherNetworks) {
    try {
      console.log(`\n📡 Setting trusted emitter for ${remoteNetwork}...`);
      
      // Convert bridge address to 32-byte format (Wormhole standard)
      const bridgeAddress = remoteDeployment.bridgeAddress.replace('0x', '');
      const emitterBytes = new Uint8Array(32);
      const addressBytes = Buffer.from(bridgeAddress, 'hex');
      emitterBytes.set(addressBytes, 32 - addressBytes.length); // Left-pad with zeros
      
      const emitterAddress = '0x' + Buffer.from(emitterBytes).toString('hex');
      
      console.log(`  Remote Chain ID: ${remoteDeployment.wormholeChainId}`);
      console.log(`  Remote Bridge: ${remoteDeployment.bridgeAddress}`);
      console.log(`  Emitter Address: ${emitterAddress}`);
      
      // Check if emitter is already set
      const existingEmitter = await wormholeBridge.getTrustedEmitter(remoteDeployment.wormholeChainId);
      if (existingEmitter !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log(`  ✅ Trusted emitter already set for ${remoteNetwork}`);
        configurationResults.push({
          network: remoteNetwork,
          wormholeChainId: remoteDeployment.wormholeChainId,
          success: true,
          txHash: "already_set"
        });
        continue;
      }
      
      // Set trusted emitter
      const tx = await wormholeBridge.setTrustedEmitter(
        remoteDeployment.wormholeChainId,
        emitterAddress
      );
      
      console.log(`  📤 Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`  ✅ Trusted emitter set for ${remoteNetwork} (Gas used: ${receipt?.gasUsed})`);
      
      // Verify the setting
      const verifyEmitter = await wormholeBridge.getTrustedEmitter(remoteDeployment.wormholeChainId);
      if (verifyEmitter.toLowerCase() === emitterAddress.toLowerCase()) {
        console.log(`  ✅ Verification successful`);
        configurationResults.push({
          network: remoteNetwork,
          wormholeChainId: remoteDeployment.wormholeChainId,
          success: true,
          txHash: tx.hash
        });
      } else {
        console.log(`  ❌ Verification failed`);
        configurationResults.push({
          network: remoteNetwork,
          wormholeChainId: remoteDeployment.wormholeChainId,
          success: false,
          error: "Verification failed"
        });
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to set trusted emitter for ${remoteNetwork}:`, error);
      configurationResults.push({
        network: remoteNetwork,
        wormholeChainId: remoteDeployment.wormholeChainId,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  console.log("\n🎯 Emitter Configuration Complete!");
  console.log("\n📋 Summary:");
  console.log(`  Current Network: ${networkName}`);
  console.log(`  Bridge Address: ${currentDeployment.bridgeAddress}`);
  console.log(`  Trusted Emitters Set: ${configurationResults.filter(r => r.success).length}`);
  console.log(`  Failed Configurations: ${configurationResults.filter(r => !r.success).length}`);
  
  if (configurationResults.some(r => !r.success)) {
    console.log("\n❌ Failed Configurations:");
    configurationResults.filter(r => !r.success).forEach(result => {
      console.log(`   ${result.network}: ${result.error}`);
    });
  }
  
  // Test message fee calculation
  console.log("\n💰 Testing Message Fees...");
  try {
    const messageFee = await wormholeBridge.getMessageFee();
    console.log(`  Message Fee: ${ethers.formatEther(messageFee)} ETH`);
    
    // Check bridge balance
    const bridgeBalance = await ethers.provider.getBalance(currentDeployment.bridgeAddress);
    console.log(`  Bridge Balance: ${ethers.formatEther(bridgeBalance)} ETH`);
    
    if (bridgeBalance < messageFee) {
      console.log(`  ⚠️  Bridge needs funding for message fees`);
      console.log(`  Send at least ${ethers.formatEther(messageFee)} ETH to: ${currentDeployment.bridgeAddress}`);
    }
  } catch (error) {
    console.error("  ❌ Failed to get message fee:", error);
  }
  
  // Save configuration results
  const configFile = path.join(__dirname, "..", "deployments", "wormhole-bridges", `${networkName}-emitters.json`);
  const configData = {
    network: networkName,
    bridgeAddress: currentDeployment.bridgeAddress,
    wormholeChainId: currentDeployment.wormholeChainId,
    configuredEmitters: configurationResults,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(configFile, JSON.stringify(configData, null, 2));
  console.log(`\n💾 Configuration saved to: ${configFile}`);
  
  console.log("\n🔍 Next Steps:");
  console.log("1. Run this script on each deployed network");
  console.log("2. Fund bridges with ETH for message fees");
  console.log("3. Test cross-chain transfers");
  console.log("4. Set up automated relayers");
  
  console.log("\n🧪 Testing Commands:");
  console.log(`# Test cross-chain transfer`);
  console.log(`npx hardhat run scripts/test-wormhole-transfer.ts --network ${networkName}`);
  console.log(`# Monitor Wormhole messages`);
  console.log(`# Visit: https://wormhole-foundation.github.io/wormhole-explorer/`);
  
  return configurationResults;
}

// Test cross-chain message estimation
async function testMessageEstimation() {
  console.log("\n🧪 Testing Cross-Chain Message Estimation...");
  
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  
  // Load bridge deployments
  const bridgeDeploymentsFile = path.join(__dirname, "..", "deployments", "wormhole-bridges", "all-bridges.json");
  const bridgeDeployments: Record<string, BridgeDeployment> = JSON.parse(
    fs.readFileSync(bridgeDeploymentsFile, "utf8")
  );
  
  const currentDeployment = bridgeDeployments[networkName];
  const WormholeBridge = await ethers.getContractFactory("WormholeBridge");
  const wormholeBridge = WormholeBridge.attach(currentDeployment.bridgeAddress);
  
  // Test estimation for each remote chain
  const otherNetworks = Object.entries(bridgeDeployments).filter(([network]) => network !== networkName);
  
  for (const [remoteNetwork, remoteDeployment] of otherNetworks) {
    try {
      const messageFee = await wormholeBridge.getMessageFee();
      const [bridged, received] = await wormholeBridge.getBridgeStats();
      
      console.log(`  ${remoteNetwork}:`);
      console.log(`    Message Fee: ${ethers.formatEther(messageFee)} ETH`);
      console.log(`    Total Bridged: ${ethers.formatEther(bridged)} BTCM`);
      console.log(`    Total Received: ${ethers.formatEther(received)} BTCM`);
      
    } catch (error) {
      console.error(`  ❌ Estimation failed for ${remoteNetwork}:`, error);
    }
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => testMessageEstimation())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Emitter setup failed:", error);
      process.exit(1);
    });
}

export { main as setupWormholeEmitters };