import { ethers } from "hardhat";
import { LAYERZERO_ENDPOINTS } from "./layerzero-config";

async function main() {
  console.log("💰 BTCMiner Wallet Balance Checker");
  console.log("==================================");
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Wallet Address: ${deployer.address}`);
  console.log("");
  
  // Check balances on all configured networks
  const networks = [
    { name: "sepolia", rpc: process.env.SEPOLIA_RPC_URL },
    { name: "bscTestnet", rpc: process.env.BSC_TESTNET_RPC_URL },
    { name: "baseSepolia", rpc: process.env.BASE_SEPOLIA_RPC_URL },
  ];
  
  for (const network of networks) {
    if (!network.rpc) {
      console.log(`⚠️  ${network.name}: RPC URL not configured`);
      continue;
    }
    
    try {
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const balance = await provider.getBalance(deployer.address);
      const balanceEth = ethers.formatEther(balance);
      
      const lzConfig = LAYERZERO_ENDPOINTS[network.name];
      const status = parseFloat(balanceEth) > 0.01 ? "✅" : "❌";
      
      console.log(`${status} ${network.name}:`);
      console.log(`   Balance: ${balanceEth} ETH`);
      console.log(`   Chain ID: ${lzConfig?.chainId || "Unknown"}`);
      console.log(`   LZ Chain ID: ${lzConfig?.lzChainId || "Unknown"}`);
      console.log(`   Status: ${parseFloat(balanceEth) > 0.01 ? "Ready for deployment" : "Needs testnet tokens"}`);
      console.log("");
      
    } catch (error) {
      console.log(`❌ ${network.name}: Connection failed`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      console.log("");
    }
  }
  
  console.log("🔗 Testnet Faucet Links:");
  console.log("========================");
  console.log("🔵 Ethereum Sepolia:");
  console.log("   • https://sepoliafaucet.com/");
  console.log("   • https://faucet.quicknode.com/ethereum/sepolia");
  console.log("");
  console.log("🟡 BNB Chain Testnet:");
  console.log("   • https://testnet.bnbchain.org/faucet-smart");
  console.log("   • https://testnet.binance.org/faucet-smart");
  console.log("");
  console.log("🔵 Base Sepolia:");
  console.log("   • https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
  console.log("   • https://bridge.base.org/deposit (bridge from Sepolia)");
  console.log("");
  
  console.log("💡 Deployment Requirements:");
  console.log("===========================");
  console.log("• Minimum 0.01 ETH per network for deployment");
  console.log("• Recommended 0.05 ETH per network for testing");
  console.log("• Total recommended: ~0.15 ETH across all testnets");
  console.log("");
  
  console.log("🚀 Next Steps:");
  console.log("==============");
  console.log("1. Get testnet tokens from faucets above");
  console.log("2. Run this script again to verify balances");
  console.log("3. Deploy to individual networks: npx hardhat run scripts/deploy-testnet.ts --network NETWORK_NAME");
  console.log("4. Deploy to all networks: npx hardhat run scripts/deploy-all-testnets.ts");
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Balance check failed:", error);
      process.exit(1);
    });
}

export { main as checkBalances };