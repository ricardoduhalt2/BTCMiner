import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BtcminerSolana } from "../solana/target/types/btcminer_solana";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

interface SolanaDeploymentResult {
  network: string;
  programId: string;
  configPda: string;
  mint: string;
  authorityTokenAccount: string;
  deploymentTx: string;
  initializeTx: string;
  deployer: string;
  timestamp: number;
  cluster: string;
}

async function main() {
  console.log("🚀 BTCMiner Solana Program Deployment");
  console.log("=====================================");

  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BtcminerSolana as Program<BtcminerSolana>;
  const authority = provider.wallet as anchor.Wallet;

  console.log(`📍 Cluster: ${provider.connection.rpcEndpoint}`);
  console.log(`🆔 Program ID: ${program.programId.toString()}`);
  console.log(`👤 Authority: ${authority.publicKey.toString()}`);

  // Check SOL balance
  const balance = await provider.connection.getBalance(authority.publicKey);
  console.log(`💰 SOL Balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);

  if (balance < 0.1 * anchor.web3.LAMPORTS_PER_SOL) {
    throw new Error("Insufficient SOL balance. Need at least 0.1 SOL for deployment.");
  }

  // Find config PDA
  const [configPda, configBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  console.log(`🔑 Config PDA: ${configPda.toString()}`);
  console.log(`🔢 Config Bump: ${configBump}`);

  // Create mint
  console.log("\n📦 Creating BTCMiner SPL Token...");
  const mint = await createMint(
    provider.connection,
    authority.payer,
    configPda, // Mint authority will be the config PDA
    null, // Freeze authority
    9, // 9 decimals
    undefined, // Keypair (let it generate)
    undefined, // Confirm options
    TOKEN_PROGRAM_ID
  );

  console.log(`🪙 Mint Address: ${mint.toString()}`);

  // Create associated token account for authority
  const authorityTokenAccount = await getAssociatedTokenAddress(
    mint,
    authority.publicKey
  );

  console.log(`💼 Authority Token Account: ${authorityTokenAccount.toString()}`);

  // Configuration parameters
  const WORMHOLE_BRIDGE = new anchor.web3.PublicKey("worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth"); // Devnet Wormhole
  const INITIAL_SUPPLY = new anchor.BN(100_000_000 * 10**9); // 100M tokens with 9 decimals

  console.log(`🌉 Wormhole Bridge: ${WORMHOLE_BRIDGE.toString()}`);
  console.log(`💎 Initial Supply: ${INITIAL_SUPPLY.toString()} (100M BTCM)`);

  // Initialize the program
  console.log("\n🔧 Initializing BTCMiner Program...");
  
  try {
    const initTx = await program.methods
      .initialize(WORMHOLE_BRIDGE, INITIAL_SUPPLY)
      .accounts({
        config: configPda,
        mint: mint,
        authorityTokenAccount: authorityTokenAccount,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log(`✅ Initialization Transaction: ${initTx}`);

    // Verify initialization
    console.log("\n🔍 Verifying Deployment...");
    const config = await program.account.config.fetch(configPda);
    
    console.log(`✅ Authority: ${config.authority.toString()}`);
    console.log(`✅ Wormhole Bridge: ${config.wormholebridge.toString()}`);
    console.log(`✅ Total Burned: ${config.totalBurned.toString()}`);
    console.log(`✅ Total Minted: ${config.totalMinted.toString()}`);
    console.log(`✅ Daily Burn Limit: ${config.dailyBurnLimit.toString()}`);
    console.log(`✅ Paused: ${config.paused}`);

    // Check token supply
    const mintInfo = await provider.connection.getParsedAccountInfo(mint);
    if (mintInfo.value?.data && 'parsed' in mintInfo.value.data) {
      const supply = mintInfo.value.data.parsed.info.supply;
      console.log(`✅ Token Supply: ${supply} (${supply / 10**9} BTCM)`);
    }

    // Save deployment information
    const deploymentResult: SolanaDeploymentResult = {
      network: "solana",
      programId: program.programId.toString(),
      configPda: configPda.toString(),
      mint: mint.toString(),
      authorityTokenAccount: authorityTokenAccount.toString(),
      deploymentTx: "N/A", // Program deployment handled by Anchor
      initializeTx: initTx,
      deployer: authority.publicKey.toString(),
      timestamp: Date.now(),
      cluster: provider.connection.rpcEndpoint.includes("devnet") ? "devnet" : 
               provider.connection.rpcEndpoint.includes("mainnet") ? "mainnet" : "localnet"
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment file
    const deploymentFile = path.join(deploymentsDir, "solana-deployment.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResult, null, 2));

    console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

    // Display summary
    console.log("\n🎯 DEPLOYMENT SUMMARY");
    console.log("====================");
    console.log(`📍 Cluster: ${deploymentResult.cluster}`);
    console.log(`🆔 Program ID: ${deploymentResult.programId}`);
    console.log(`🔑 Config PDA: ${deploymentResult.configPda}`);
    console.log(`🪙 Mint: ${deploymentResult.mint}`);
    console.log(`💼 Authority Token Account: ${deploymentResult.authorityTokenAccount}`);
    console.log(`📋 Init Transaction: ${deploymentResult.initializeTx}`);

    console.log("\n🔗 Explorer Links:");
    const explorerBase = deploymentResult.cluster === "mainnet" 
      ? "https://explorer.solana.com" 
      : `https://explorer.solana.com?cluster=${deploymentResult.cluster}`;
    
    console.log(`🆔 Program: ${explorerBase}/address/${deploymentResult.programId}`);
    console.log(`🪙 Token: ${explorerBase}/address/${deploymentResult.mint}`);
    console.log(`📋 Transaction: ${explorerBase}/tx/${deploymentResult.initializeTx}`);

    console.log("\n🧪 Testing Commands:");
    console.log("===================");
    console.log("# Run tests");
    console.log("anchor test");
    console.log("");
    console.log("# Test cross-chain burn");
    console.log(`anchor run test-burn --provider.cluster ${deploymentResult.cluster}`);
    console.log("");
    console.log("# Check program logs");
    console.log(`solana logs ${deploymentResult.programId} --url ${provider.connection.rpcEndpoint}`);

    console.log("\n🎯 Next Steps:");
    console.log("==============");
    console.log("1. Test cross-chain functionality");
    console.log("2. Add trusted emitters for EVM chains");
    console.log("3. Configure Pyth price feeds");
    console.log("4. Deploy ICP canisters (Task 1.6)");
    console.log("5. Integrate with frontend");

    return deploymentResult;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    // Check if it's an account already exists error
    if (error.message?.includes("already in use")) {
      console.log("\n💡 Program may already be initialized. Checking existing deployment...");
      
      try {
        const config = await program.account.config.fetch(configPda);
        console.log("✅ Found existing deployment:");
        console.log(`   Authority: ${config.authority.toString()}`);
        console.log(`   Mint Authority: ${configPda.toString()}`);
        console.log(`   Total Supply: ${config.totalMinted.toString()}`);
        
        return {
          network: "solana",
          programId: program.programId.toString(),
          configPda: configPda.toString(),
          mint: mint.toString(),
          authorityTokenAccount: authorityTokenAccount.toString(),
          deploymentTx: "existing",
          initializeTx: "existing",
          deployer: authority.publicKey.toString(),
          timestamp: Date.now(),
          cluster: provider.connection.rpcEndpoint.includes("devnet") ? "devnet" : "localnet"
        };
      } catch (fetchError) {
        console.error("❌ Could not fetch existing config:", fetchError);
      }
    }
    
    throw error;
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎉 Solana deployment completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Solana deployment failed:", error);
      process.exit(1);
    });
}

export { main as deploySolana };