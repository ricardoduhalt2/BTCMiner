import { ethers } from "hardhat";
import { LAYERZERO_ENDPOINTS, DEPLOYMENT_CONFIG, GAS_LIMITS } from "./layerzero-config";
import * as fs from "fs";
import * as path from "path";

interface DeploymentResult {
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
  console.log("🚀 Starting BTCMiner OFT Testnet Deployment");
  console.log("==========================================");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  
  console.log(`📍 Network: ${networkName}`);
  console.log(`🔗 Chain ID: ${network.chainId}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  
  // Get LayerZero configuration for current network
  const lzConfig = LAYERZERO_ENDPOINTS[networkName];
  if (!lzConfig) {
    throw new Error(`LayerZero configuration not found for network: ${networkName}`);
  }
  
  console.log(`🌐 LayerZero Endpoint: ${lzConfig.endpoint}`);
  console.log(`🔢 LayerZero Chain ID: ${lzConfig.lzChainId}`);
  
  // Deploy BTCMiner contract
  console.log("\n📦 Deploying BTCMiner OFT contract...");
  
  const BTCMiner = await ethers.getContractFactory("BTCMiner");
  const btcMiner = await BTCMiner.deploy(
    lzConfig.endpoint,
    DEPLOYMENT_CONFIG.TOKEN_NAME,
    DEPLOYMENT_CONFIG.TOKEN_SYMBOL
  );
  
  await btcMiner.waitForDeployment();
  const contractAddress = await btcMiner.getAddress();
  
  console.log(`✅ BTCMiner deployed to: ${contractAddress}`);
  
  // Get deployment transaction details
  const deploymentTx = btcMiner.deploymentTransaction();
  if (!deploymentTx) {
    throw new Error("Deployment transaction not found");
  }
  
  const receipt = await deploymentTx.wait();
  if (!receipt) {
    throw new Error("Transaction receipt not found");
  }
  
  console.log(`📋 Transaction Hash: ${deploymentTx.hash}`);
  console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
  
  // Verify contract deployment
  console.log("\n🔍 Verifying contract deployment...");
  const tokenName = await btcMiner.name();
  const tokenSymbol = await btcMiner.symbol();
  const totalSupply = await btcMiner.totalSupply();
  const lzEndpoint = await btcMiner.lzEndpoint();
  
  console.log(`📛 Token Name: ${tokenName}`);
  console.log(`🏷️  Token Symbol: ${tokenSymbol}`);
  console.log(`💎 Total Supply: ${ethers.formatEther(totalSupply)} ${tokenSymbol}`);
  console.log(`🔗 LZ Endpoint: ${lzEndpoint}`);
  
  // Save deployment information
  const deploymentResult: DeploymentResult = {
    network: networkName,
    chainId: Number(network.chainId),
    lzChainId: lzConfig.lzChainId,
    contractAddress: contractAddress,
    deploymentTx: deploymentTx.hash,
    deployer: deployer.address,
    gasUsed: receipt.gasUsed.toString(),
    timestamp: Date.now()
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save individual deployment file
  const deploymentFile = path.join(deploymentsDir, `${networkName}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResult, null, 2));
  
  // Update or create master deployments file
  const masterFile = path.join(deploymentsDir, "testnet-deployments.json");
  let masterDeployments: Record<string, DeploymentResult> = {};
  
  if (fs.existsSync(masterFile)) {
    masterDeployments = JSON.parse(fs.readFileSync(masterFile, "utf8"));
  }
  
  masterDeployments[networkName] = deploymentResult;
  fs.writeFileSync(masterFile, JSON.stringify(masterDeployments, null, 2));
  
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);
  console.log(`📊 Master deployments updated: ${masterFile}`);
  
  // Display next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Deploy to other testnets (BNB Chain, Base)");
  console.log("2. Configure trusted remotes between chains");
  console.log("3. Test cross-chain functionality");
  console.log("4. Verify contracts on block explorers");
  
  console.log(`\n🔗 Verify contract on explorer:`);
  console.log(`npx hardhat verify --network ${networkName} ${contractAddress} "${lzConfig.endpoint}" "${DEPLOYMENT_CONFIG.TOKEN_NAME}" "${DEPLOYMENT_CONFIG.TOKEN_SYMBOL}"`);
  
  return deploymentResult;
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export { main as deployTestnet };