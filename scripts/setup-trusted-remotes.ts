import { ethers } from "hardhat";
import { LAYERZERO_ENDPOINTS } from "./layerzero-config";
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

async function main() {
  console.log("🔗 Setting up Trusted Remotes for BTCMiner OFT");
  console.log("==============================================");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  
  console.log(`📍 Current Network: ${networkName}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  
  // Load deployment information
  const deploymentsFile = path.join(__dirname, "..", "deployments", "testnet-deployments.json");
  if (!fs.existsSync(deploymentsFile)) {
    throw new Error("Deployment file not found. Please deploy contracts first.");
  }
  
  const deployments: Record<string, DeploymentInfo> = JSON.parse(
    fs.readFileSync(deploymentsFile, "utf8")
  );
  
  console.log("\n📋 Available Deployments:");
  Object.entries(deployments).forEach(([network, info]) => {
    console.log(`  ${network}: ${info.contractAddress} (LZ Chain ID: ${info.lzChainId})`);
  });
  
  // Get current network deployment
  const currentDeployment = deployments[networkName];
  if (!currentDeployment) {
    throw new Error(`No deployment found for network: ${networkName}`);
  }
  
  // Connect to the deployed contract
  const BTCMiner = await ethers.getContractFactory("BTCMiner");
  const btcMiner = BTCMiner.attach(currentDeployment.contractAddress);
  
  console.log(`\n🔌 Connected to BTCMiner at: ${currentDeployment.contractAddress}`);
  
  // Set up trusted remotes for all other networks
  const otherNetworks = Object.entries(deployments).filter(([network]) => network !== networkName);
  
  if (otherNetworks.length === 0) {
    console.log("⚠️  No other networks found. Deploy to additional testnets first.");
    return;
  }
  
  console.log(`\n🔧 Setting up trusted remotes for ${otherNetworks.length} networks...`);
  
  for (const [remoteNetwork, remoteDeployment] of otherNetworks) {
    try {
      console.log(`\n📡 Setting trusted remote for ${remoteNetwork}...`);
      
      // Create trusted remote path: remoteAddress + localAddress (both 20 bytes)
      const remotePath = ethers.solidityPacked(
        ["address", "address"],
        [remoteDeployment.contractAddress, currentDeployment.contractAddress]
      );
      
      console.log(`  Remote LZ Chain ID: ${remoteDeployment.lzChainId}`);
      console.log(`  Remote Address: ${remoteDeployment.contractAddress}`);
      console.log(`  Trusted Path: ${remotePath}`);
      
      // Check if trusted remote is already set
      const existingPath = await btcMiner.trustedRemoteLookup(remoteDeployment.lzChainId);
      if (existingPath && existingPath !== "0x") {
        console.log(`  ✅ Trusted remote already set for ${remoteNetwork}`);
        continue;
      }
      
      // Set trusted remote
      const tx = await btcMiner.setTrustedRemote(remoteDeployment.lzChainId, remotePath);
      console.log(`  📤 Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`  ✅ Trusted remote set for ${remoteNetwork} (Gas used: ${receipt?.gasUsed})`);
      
      // Verify the setting
      const verifyPath = await btcMiner.trustedRemoteLookup(remoteDeployment.lzChainId);
      if (verifyPath.toLowerCase() === remotePath.toLowerCase()) {
        console.log(`  ✅ Verification successful`);
      } else {
        console.log(`  ❌ Verification failed`);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to set trusted remote for ${remoteNetwork}:`, error);
    }
  }
  
  console.log("\n🎯 Trusted Remote Setup Complete!");
  console.log("\n📋 Summary:");
  console.log(`  Current Network: ${networkName}`);
  console.log(`  Contract Address: ${currentDeployment.contractAddress}`);
  console.log(`  Trusted Remotes Set: ${otherNetworks.length}`);
  
  console.log("\n🔍 Next Steps:");
  console.log("1. Run this script on each deployed network");
  console.log("2. Test cross-chain transfers");
  console.log("3. Verify gas estimation functions");
  console.log("4. Monitor cross-chain transaction success rates");
}

// Test cross-chain functionality
async function testCrossChainEstimation() {
  console.log("\n🧪 Testing Cross-Chain Gas Estimation...");
  
  const [deployer] = await ethers.getSigners();
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  
  // Load deployments
  const deploymentsFile = path.join(__dirname, "..", "deployments", "testnet-deployments.json");
  const deployments: Record<string, DeploymentInfo> = JSON.parse(
    fs.readFileSync(deploymentsFile, "utf8")
  );
  
  const currentDeployment = deployments[networkName];
  const BTCMiner = await ethers.getContractFactory("BTCMiner");
  const btcMiner = BTCMiner.attach(currentDeployment.contractAddress);
  
  // Test estimation for each remote chain
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
      
      console.log(`  ${remoteNetwork}:`);
      console.log(`    Native Fee: ${ethers.formatEther(nativeFee)} ETH`);
      console.log(`    ZRO Fee: ${ethers.formatEther(zroFee)} ZRO`);
      
    } catch (error) {
      console.error(`  ❌ Estimation failed for ${remoteNetwork}:`, error);
    }
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => testCrossChainEstimation())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Setup failed:", error);
      process.exit(1);
    });
}

export { main as setupTrustedRemotes };