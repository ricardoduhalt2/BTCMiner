import { ethers } from "hardhat";
import { BTCMiner } from "../typechain-types";
import * as fs from "fs";
import * as path from "path";

// 🌟 SURPRISE: Multi-Chain Deployment Orchestrator with Real-Time Monitoring
// This script will deploy BTCMiner across multiple chains simultaneously!

interface ChainConfig {
  name: string;
  chainId: string;
  rpcUrl: string;
  lzEndpoint: string;
  lzChainId: number;
  blockExplorer: string;
  nativeCurrency: string;
  emoji: string;
}

const CHAINS: Record<string, ChainConfig> = {
  sepolia: {
    name: "Ethereum Sepolia",
    chainId: "11155111",
    rpcUrl: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_KEY",
    lzEndpoint: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
    lzChainId: 10161,
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: "ETH",
    emoji: "🔷"
  },
  bscTestnet: {
    name: "BNB Chain Testnet",
    chainId: "97",
    rpcUrl: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
    lzEndpoint: "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1",
    lzChainId: 10102,
    blockExplorer: "https://testnet.bscscan.com",
    nativeCurrency: "BNB",
    emoji: "🟡"
  },
  baseSepolia: {
    name: "Base Sepolia",
    chainId: "84532",
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    lzEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    lzChainId: 10160,
    blockExplorer: "https://sepolia-explorer.base.org",
    nativeCurrency: "ETH",
    emoji: "🔵"
  }
};

interface DeploymentResult {
  chain: string;
  success: boolean;
  contractAddress?: string;
  txHash?: string;
  gasUsed?: string;
  deploymentTime?: number;
  error?: string;
}

class MultiChainDeployer {
  private results: DeploymentResult[] = [];
  private startTime: number = Date.now();

  constructor() {
    this.printBanner();
  }

  private printBanner() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 BTCMiner Multi-Chain                   ║
║                   Deployment Orchestrator                    ║
║                                                              ║
║  🔷 Ethereum Sepolia  🟡 BNB Chain  🔵 Base Sepolia        ║
║                                                              ║
║              Deploying across the multiverse...             ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }

  private async deployToChain(chainKey: string, config: ChainConfig): Promise<DeploymentResult> {
    const deployStart = Date.now();
    
    try {
      console.log(`\n${config.emoji} Starting deployment on ${config.name}...`);
      
      // Create provider for this specific chain
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
      
      console.log(`${config.emoji} Deployer: ${wallet.address}`);
      
      // Check balance
      const balance = await provider.getBalance(wallet.address);
      console.log(`${config.emoji} Balance: ${ethers.formatEther(balance)} ${config.nativeCurrency}`);
      
      if (balance === 0n) {
        throw new Error(`Insufficient ${config.nativeCurrency} balance`);
      }

      // Deploy contract
      const BTCMinerFactory = new ethers.ContractFactory(
        require("../artifacts/contracts/BTCMiner.sol/BTCMiner.json").abi,
        require("../artifacts/contracts/BTCMiner.sol/BTCMiner.json").bytecode,
        wallet
      );

      console.log(`${config.emoji} Deploying BTCMiner contract...`);
      const btcMiner = await BTCMinerFactory.deploy(
        config.lzEndpoint,
        "BTCMiner Token",
        "BTCM"
      ) as BTCMiner;

      console.log(`${config.emoji} Waiting for confirmation...`);
      await btcMiner.waitForDeployment();
      
      const contractAddress = await btcMiner.getAddress();
      const deploymentTx = btcMiner.deploymentTransaction();
      
      const deploymentTime = Date.now() - deployStart;
      
      console.log(`${config.emoji} ✅ SUCCESS! Contract deployed to: ${contractAddress}`);
      console.log(`${config.emoji} 📊 Gas used: ${deploymentTx?.gasLimit?.toString()}`);
      console.log(`${config.emoji} ⏱️  Deployment time: ${deploymentTime}ms`);
      console.log(`${config.emoji} 🔗 Explorer: ${config.blockExplorer}/address/${contractAddress}`);

      return {
        chain: chainKey,
        success: true,
        contractAddress,
        txHash: deploymentTx?.hash,
        gasUsed: deploymentTx?.gasLimit?.toString(),
        deploymentTime,
      };

    } catch (error: any) {
      const deploymentTime = Date.now() - deployStart;
      console.log(`${config.emoji} ❌ FAILED: ${error.message}`);
      
      return {
        chain: chainKey,
        success: false,
        deploymentTime,
        error: error.message,
      };
    }
  }

  private async deployAllChains(): Promise<void> {
    console.log("\n🚀 Initiating simultaneous multi-chain deployment...\n");
    
    // Deploy to all chains simultaneously
    const deploymentPromises = Object.entries(CHAINS).map(([key, config]) =>
      this.deployToChain(key, config)
    );

    // Wait for all deployments to complete
    this.results = await Promise.all(deploymentPromises);
  }

  private generateReport(): void {
    const totalTime = Date.now() - this.startTime;
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    📊 DEPLOYMENT REPORT                      ║
╚══════════════════════════════════════════════════════════════╝

⏱️  Total Time: ${totalTime}ms
✅ Successful: ${successful.length}/${this.results.length}
❌ Failed: ${failed.length}/${this.results.length}

📋 DETAILED RESULTS:
    `);

    this.results.forEach(result => {
      const config = CHAINS[result.chain];
      if (result.success) {
        console.log(`
${config.emoji} ${config.name}
   ✅ Status: SUCCESS
   📍 Address: ${result.contractAddress}
   ⛽ Gas: ${result.gasUsed}
   ⏱️  Time: ${result.deploymentTime}ms
   🔗 Explorer: ${config.blockExplorer}/address/${result.contractAddress}
        `);
      } else {
        console.log(`
${config.emoji} ${config.name}
   ❌ Status: FAILED
   💥 Error: ${result.error}
   ⏱️  Time: ${result.deploymentTime}ms
        `);
      }
    });

    // Save deployment data
    this.saveDeploymentData();
  }

  private saveDeploymentData(): void {
    const deploymentData = {
      timestamp: new Date().toISOString(),
      totalTime: Date.now() - this.startTime,
      results: this.results.map(result => ({
        ...result,
        chainConfig: CHAINS[result.chain]
      }))
    };

    const fileName = `deployment-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(deploymentData, null, 2));
    console.log(`\n💾 Deployment data saved to: ${fileName}`);
  }

  private async setupTrustedRemotes(): Promise<void> {
    console.log("\n🔗 Setting up trusted remotes for cross-chain communication...");
    
    const successfulDeployments = this.results.filter(r => r.success);
    
    if (successfulDeployments.length < 2) {
      console.log("❌ Need at least 2 successful deployments to set up trusted remotes");
      return;
    }

    for (const deployment of successfulDeployments) {
      const config = CHAINS[deployment.chain];
      console.log(`\n${config.emoji} Setting up trusted remotes for ${config.name}...`);
      
      try {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
        const btcMiner = new ethers.Contract(
          deployment.contractAddress!,
          require("../artifacts/contracts/BTCMiner.sol/BTCMiner.json").abi,
          wallet
        );

        // Set trusted remotes for all other successful deployments
        for (const otherDeployment of successfulDeployments) {
          if (otherDeployment.chain === deployment.chain) continue;
          
          const otherConfig = CHAINS[otherDeployment.chain];
          const trustedRemotePath = ethers.solidityPacked(
            ["address", "address"],
            [otherDeployment.contractAddress!, deployment.contractAddress!]
          );

          console.log(`${config.emoji} → ${otherConfig.emoji} Setting trusted remote...`);
          const tx = await btcMiner.setTrustedRemote(otherConfig.lzChainId, trustedRemotePath);
          await tx.wait();
          console.log(`${config.emoji} → ${otherConfig.emoji} ✅ Trusted remote set!`);
        }
      } catch (error: any) {
        console.log(`${config.emoji} ❌ Failed to set trusted remotes: ${error.message}`);
      }
    }
  }

  public async run(): Promise<void> {
    try {
      await this.deployAllChains();
      this.generateReport();
      await this.setupTrustedRemotes();
      
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🎉 DEPLOYMENT COMPLETE!                   ║
║                                                              ║
║  Your BTCMiner tokens are now live across multiple chains!  ║
║              Ready to bridge the multiverse! 🌉             ║
╚══════════════════════════════════════════════════════════════╝
      `);
      
    } catch (error) {
      console.error("💥 Deployment orchestrator failed:", error);
      process.exit(1);
    }
  }
}

// 🚀 Launch the multi-chain deployment!
async function main() {
  const deployer = new MultiChainDeployer();
  await deployer.run();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });