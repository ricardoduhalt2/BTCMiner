import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface WormholeConfig {
  chainId: number;
  wormholeChainId: number;
  wormholeCore: string;
  name: string;
}

// Wormhole Core Bridge addresses
const WORMHOLE_CONFIGS: Record<string, WormholeConfig> = {
  // Testnets
  sepolia: {
    chainId: 11155111,
    wormholeChainId: 10002,
    wormholeCore: "0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78",
    name: "Ethereum Sepolia"
  },
  bscTestnet: {
    chainId: 97,
    wormholeChainId: 4,
    wormholeCore: "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D",
    name: "BNB Chain Testnet"
  },
  baseSepolia: {
    chainId: 84532,
    wormholeChainId: 30,
    wormholeCore: "0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78", // Base uses same as Ethereum
    name: "Base Sepolia"
  },
  
  // Mainnets (for future use)
  ethereum: {
    chainId: 1,
    wormholeChainId: 2,
    wormholeCore: "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B",
    name: "Ethereum Mainnet"
  },
  bsc: {
    chainId: 56,
    wormholeChainId: 4,
    wormholeCore: "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B",
    name: "BNB Chain Mainnet"
  },
  base: {
    chainId: 8453,
    wormholeChainId: 30,
    wormholeCore: "0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B",
    name: "Base Mainnet"
  }
};

interface DeploymentResult {
  network: string;
  chainId: number;
  wormholeChainId: number;
  bridgeAddress: string;
  btcMinerAddress: string;
  wormholeCoreAddress: string;
  deploymentTx: string;
  deployer: string;
  gasUsed: string;
  timestamp: number;
}

async function main() {
  console.log("🌉 BTCMiner Wormhole Bridge Deployment");
  console.log("======================================");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  
  console.log(`📍 Network: ${networkName}`);
  console.log(`🔗 Chain ID: ${network.chainId}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  
  // Get Wormhole configuration for current network
  const wormholeConfig = WORMHOLE_CONFIGS[networkName];
  if (!wormholeConfig) {
    throw new Error(`Wormhole configuration not found for network: ${networkName}`);
  }
  
  console.log(`🌉 Wormhole Core: ${wormholeConfig.wormholeCore}`);
  console.log(`🔢 Wormhole Chain ID: ${wormholeConfig.wormholeChainId}`);
  
  // Load BTCMiner deployment
  const deploymentsFile = path.join(__dirname, "..", "deployments", "testnet-deployments.json");
  if (!fs.existsSync(deploymentsFile)) {
    throw new Error("BTCMiner deployments not found. Deploy BTCMiner contracts first.");
  }
  
  const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
  const btcMinerDeployment = deployments[networkName];
  
  if (!btcMinerDeployment) {
    throw new Error(`BTCMiner deployment not found for network: ${networkName}`);
  }
  
  console.log(`🪙 BTCMiner Address: ${btcMinerDeployment.contractAddress}`);
  
  // Deploy WormholeBridge contract
  console.log("\n📦 Deploying WormholeBridge contract...");
  
  const WormholeBridge = await ethers.getContractFactory("WormholeBridge");
  const wormholeBridge = await WormholeBridge.deploy(
    wormholeConfig.wormholeCore,
    btcMinerDeployment.contractAddress,
    wormholeConfig.wormholeChainId
  );
  
  await wormholeBridge.waitForDeployment();
  const bridgeAddress = await wormholeBridge.getAddress();
  
  console.log(`✅ WormholeBridge deployed to: ${bridgeAddress}`);
  
  // Get deployment transaction details
  const deploymentTx = wormholeBridge.deploymentTransaction();
  if (!deploymentTx) {
    throw new Error("Deployment transaction not found");
  }
  
  const receipt = await deploymentTx.wait();
  if (!receipt) {
    throw new Error("Transaction receipt not found");
  }
  
  console.log(`📋 Transaction Hash: ${deploymentTx.hash}`);
  console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
  
  // Grant necessary roles to the bridge
  console.log("\n🔧 Configuring BTCMiner permissions...");
  
  const BTCMiner = await ethers.getContractFactory("BTCMiner");
  const btcMiner = BTCMiner.attach(btcMinerDeployment.contractAddress);
  
  // Grant ROUTER_ROLE to the bridge for burning tokens
  const ROUTER_ROLE = await btcMiner.ROUTER_ROLE();
  const grantRoleTx = await btcMiner.grantRole(ROUTER_ROLE, bridgeAddress);
  await grantRoleTx.wait();
  
  console.log(`✅ Granted ROUTER_ROLE to bridge: ${grantRoleTx.hash}`);
  
  // Grant RELAYER_ROLE to deployer for testing
  const RELAYER_ROLE = await wormholeBridge.RELAYER_ROLE();
  const grantRelayerTx = await wormholeBridge.grantRole(RELAYER_ROLE, deployer.address);
  await grantRelayerTx.wait();
  
  console.log(`✅ Granted RELAYER_ROLE to deployer: ${grantRelayerTx.hash}`);
  
  // Verify bridge deployment
  console.log("\n🔍 Verifying bridge deployment...");
  const bridgeWormhole = await wormholeBridge.wormhole();
  const bridgeBTCMiner = await wormholeBridge.btcMiner();
  const bridgeChainId = await wormholeBridge.chainId();
  const messageFee = await wormholeBridge.getMessageFee();
  
  console.log(`✅ Wormhole Core: ${bridgeWormhole}`);
  console.log(`✅ BTCMiner Token: ${bridgeBTCMiner}`);
  console.log(`✅ Chain ID: ${bridgeChainId}`);
  console.log(`✅ Message Fee: ${ethers.formatEther(messageFee)} ETH`);
  
  // Save deployment information
  const deploymentResult: DeploymentResult = {
    network: networkName,
    chainId: Number(network.chainId),
    wormholeChainId: wormholeConfig.wormholeChainId,
    bridgeAddress: bridgeAddress,
    btcMinerAddress: btcMinerDeployment.contractAddress,
    wormholeCoreAddress: wormholeConfig.wormholeCore,
    deploymentTx: deploymentTx.hash,
    deployer: deployer.address,
    gasUsed: receipt.gasUsed.toString(),
    timestamp: Date.now()
  };
  
  // Create bridge deployments directory
  const bridgeDeploymentsDir = path.join(__dirname, "..", "deployments", "wormhole-bridges");
  if (!fs.existsSync(bridgeDeploymentsDir)) {
    fs.mkdirSync(bridgeDeploymentsDir, { recursive: true });
  }
  
  // Save individual deployment file
  const deploymentFile = path.join(bridgeDeploymentsDir, `${networkName}-bridge.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResult, null, 2));
  
  // Update master bridge deployments file
  const masterBridgeFile = path.join(bridgeDeploymentsDir, "all-bridges.json");
  let masterBridgeDeployments: Record<string, DeploymentResult> = {};
  
  if (fs.existsSync(masterBridgeFile)) {
    masterBridgeDeployments = JSON.parse(fs.readFileSync(masterBridgeFile, "utf8"));
  }
  
  masterBridgeDeployments[networkName] = deploymentResult;
  fs.writeFileSync(masterBridgeFile, JSON.stringify(masterBridgeDeployments, null, 2));
  
  console.log(`\n💾 Bridge deployment info saved to: ${deploymentFile}`);
  console.log(`📊 Master bridge deployments updated: ${masterBridgeFile}`);
  
  // Display next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Deploy bridge to other networks");
  console.log("2. Configure trusted emitters between chains");
  console.log("3. Test cross-chain transfers");
  console.log("4. Set up automated relayers");
  
  console.log(`\n🔗 Verify bridge contract on explorer:`);
  console.log(`npx hardhat verify --network ${networkName} ${bridgeAddress} "${wormholeConfig.wormholeCore}" "${btcMinerDeployment.contractAddress}" ${wormholeConfig.wormholeChainId}`);
  
  console.log(`\n🧪 Test bridge functionality:`);
  console.log(`npx hardhat run scripts/test-wormhole-bridge.ts --network ${networkName}`);
  
  return deploymentResult;
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Wormhole bridge deployment failed:", error);
      process.exit(1);
    });
}

export { main as deployWormholeBridge };