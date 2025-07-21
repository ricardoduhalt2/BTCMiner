import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BtcminerSolana } from "../solana/target/types/btcminer_solana";
import * as fs from "fs";
import * as path from "path";

interface ChainConfig {
  chainId: number;
  wormholeChainId: number;
  name: string;
  emitterAddress: string;
}

// Wormhole Chain IDs
const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  ethereum: {
    chainId: 1,
    wormholeChainId: 2,
    name: "Ethereum",
    emitterAddress: "0x0000000000000000000000000000000000000000000000000000000000000000" // Will be updated after EVM deployment
  },
  sepolia: {
    chainId: 11155111,
    wormholeChainId: 10002,
    name: "Ethereum Sepolia",
    emitterAddress: "0x0000000000000000000000000000000000000000000000000000000000000000"
  },
  bsc: {
    chainId: 56,
    wormholeChainId: 4,
    name: "BNB Chain",
    emitterAddress: "0x0000000000000000000000000000000000000000000000000000000000000000"
  },
  bscTestnet: {
    chainId: 97,
    wormholeChainId: 4,
    name: "BNB Chain Testnet",
    emitterAddress: "0x0000000000000000000000000000000000000000000000000000000000000000"
  },
  base: {
    chainId: 8453,
    wormholeChainId: 30,
    name: "Base",
    emitterAddress: "0x0000000000000000000000000000000000000000000000000000000000000000"
  },
  baseSepolia: {
    chainId: 84532,
    wormholeChainId: 30,
    name: "Base Sepolia",
    emitterAddress: "0x0000000000000000000000000000000000000000000000000000000000000000"
  }
};

async function main() {
  console.log("🌉 BTCMiner Solana Bridge Configuration");
  console.log("======================================");

  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BtcminerSolana as Program<BtcminerSolana>;
  const authority = provider.wallet as anchor.Wallet;

  console.log(`📍 Cluster: ${provider.connection.rpcEndpoint}`);
  console.log(`🆔 Program ID: ${program.programId.toString()}`);
  console.log(`👤 Authority: ${authority.publicKey.toString()}`);

  // Find config PDA
  const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  console.log(`🔑 Config PDA: ${configPda.toString()}`);

  // Load EVM deployment information
  const deploymentsFile = path.join(__dirname, "..", "deployments", "testnet-deployments.json");
  let evmDeployments: Record<string, any> = {};
  
  if (fs.existsSync(deploymentsFile)) {
    evmDeployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
    console.log("\n📋 Found EVM Deployments:");
    Object.entries(evmDeployments).forEach(([network, info]: [string, any]) => {
      console.log(`  ${network}: ${info.contractAddress}`);
    });
  } else {
    console.log("\n⚠️  No EVM deployments found. Deploy EVM contracts first.");
    console.log("Run: npx hardhat run scripts/deploy-all-testnets.ts");
  }

  // Configure trusted emitters
  console.log("\n🔧 Configuring Trusted Emitters...");
  
  const configuredEmitters: Array<{network: string, chainId: number, success: boolean, error?: string}> = [];

  for (const [networkName, deployment] of Object.entries(evmDeployments)) {
    const chainConfig = CHAIN_CONFIGS[networkName];
    if (!chainConfig) {
      console.log(`⚠️  No chain config found for ${networkName}`);
      continue;
    }

    try {
      console.log(`\n🔗 Setting up ${chainConfig.name} (Chain ID: ${chainConfig.wormholeChainId})`);
      
      // Convert EVM address to 32-byte array (Wormhole format)
      const contractAddress = deployment.contractAddress.replace('0x', '');
      const emitterAddress = new Uint8Array(32);
      const addressBytes = Buffer.from(contractAddress, 'hex');
      emitterAddress.set(addressBytes, 32 - addressBytes.length); // Right-pad with zeros

      console.log(`   Contract: ${deployment.contractAddress}`);
      console.log(`   Emitter: ${Buffer.from(emitterAddress).toString('hex')}`);

      // Add trusted emitter
      const tx = await program.methods
        .addTrustedEmitter(chainConfig.wormholeChainId, Array.from(emitterAddress))
        .accounts({
          config: configPda,
          authority: authority.publicKey,
        })
        .rpc();

      console.log(`   ✅ Transaction: ${tx}`);
      
      configuredEmitters.push({
        network: networkName,
        chainId: chainConfig.wormholeChainId,
        success: true
      });

    } catch (error) {
      console.error(`   ❌ Failed to configure ${networkName}:`, error);
      configuredEmitters.push({
        network: networkName,
        chainId: chainConfig.wormholeChainId,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Verify configuration
  console.log("\n🔍 Verifying Configuration...");
  try {
    const config = await program.account.config.fetch(configPda);
    console.log(`✅ Total Trusted Emitters: ${config.trustedEmitters.length}`);
    
    config.trustedEmitters.forEach((emitter, index) => {
      const [chainId, address] = emitter;
      console.log(`   ${index + 1}. Chain ${chainId}: ${Buffer.from(address).toString('hex')}`);
    });

  } catch (error) {
    console.error("❌ Failed to fetch config:", error);
  }

  // Test price oracle setup (Pyth)
  console.log("\n📊 Setting up Price Oracle Integration...");
  
  // Pyth price feed for SOL/USD (example)
  const pythPriceFeed = new anchor.web3.PublicKey("H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG");
  
  try {
    console.log(`🔮 Pyth Price Feed: ${pythPriceFeed.toString()}`);
    
    // Test price update (this would normally be called by a crank/keeper)
    const tx = await program.methods
      .updatePrice()
      .accounts({
        config: configPda,
        priceFeed: pythPriceFeed,
      })
      .rpc();

    console.log(`✅ Price Update Transaction: ${tx}`);
    
  } catch (error) {
    console.log(`⚠️  Price update test failed (expected on devnet):`, error.message);
    console.log("   This is normal if Pyth feeds are not available on devnet");
  }

  // Generate configuration summary
  const summary = {
    programId: program.programId.toString(),
    configPda: configPda.toString(),
    cluster: provider.connection.rpcEndpoint.includes("devnet") ? "devnet" : "localnet",
    trustedEmitters: configuredEmitters,
    pythPriceFeed: pythPriceFeed.toString(),
    timestamp: new Date().toISOString()
  };

  // Save configuration
  const configFile = path.join(__dirname, "..", "deployments", "solana-bridge-config.json");
  fs.writeFileSync(configFile, JSON.stringify(summary, null, 2));
  console.log(`\n💾 Configuration saved to: ${configFile}`);

  // Display summary
  console.log("\n📊 CONFIGURATION SUMMARY");
  console.log("========================");
  console.log(`✅ Successful: ${configuredEmitters.filter(e => e.success).length}`);
  console.log(`❌ Failed: ${configuredEmitters.filter(e => !e.success).length}`);
  
  if (configuredEmitters.some(e => !e.success)) {
    console.log("\n❌ Failed Configurations:");
    configuredEmitters.filter(e => !e.success).forEach(emitter => {
      console.log(`   ${emitter.network}: ${emitter.error}`);
    });
  }

  console.log("\n🧪 Testing Commands:");
  console.log("===================");
  console.log("# Test cross-chain burn to Ethereum");
  console.log(`anchor run test-cross-chain --provider.cluster devnet -- --target-chain 2`);
  console.log("");
  console.log("# Monitor program logs");
  console.log(`solana logs ${program.programId.toString()} --url ${provider.connection.rpcEndpoint}`);
  console.log("");
  console.log("# Check Wormhole messages");
  console.log("# Use Wormhole Explorer: https://wormhole-foundation.github.io/wormhole-explorer/");

  console.log("\n🎯 Next Steps:");
  console.log("==============");
  console.log("1. Test cross-chain transfers between Solana and EVM chains");
  console.log("2. Set up price monitoring with Pyth oracles");
  console.log("3. Configure automated relayers for Wormhole messages");
  console.log("4. Deploy ICP canisters for identity and monitoring");
  console.log("5. Integrate with frontend dashboard");

  return summary;
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎉 Solana bridge configuration completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Bridge configuration failed:", error);
      process.exit(1);
    });
}

export { main as setupSolanaBridge };