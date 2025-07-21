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

// Wormhole bridge addresses
const WORMHOLE_BRIDGES = {
  devnet: "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5",
  mainnet: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth"
};

interface SolanaDeploymentInfo {
  network: string;
  programId: string;
  mintAddress: string;
  configAddress: string;
  authorityTokenAccount: string;
  authority: string;
  wormholeBridge: string;
  initialSupply: string;
  timestamp: string;
}

async function main() {
  console.log("🌟 BTCMiner Solana Deployment Starting...");
  console.log("==========================================");

  // Set up provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.BtcminerSolana as Program<BtcminerSolana>;
  const authority = provider.wallet as anchor.Wallet;
  
  console.log("Program ID:", program.programId.toString());
  console.log("Authority:", authority.publicKey.toString());
  console.log("Network:", provider.connection.rpcEndpoint);

  // Determine network
  const isDevnet = provider.connection.rpcEndpoint.includes("devnet");
  const network = isDevnet ? "devnet" : "mainnet";
  const wormholeBridge = new anchor.web3.PublicKey(
    WORMHOLE_BRIDGES[network as keyof typeof WORMHOLE_BRIDGES]
  );

  console.log("Deploying to:", network);
  console.log("Wormhole Bridge:", wormholeBridge.toString());

  try {
    // Check authority balance
    const balance = await provider.connection.getBalance(authority.publicKey);
    console.log("Authority balance:", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
    
    if (balance < 0.1 * anchor.web3.LAMPORTS_PER_SOL) {
      throw new Error("Insufficient SOL balance. Need at least 0.1 SOL for deployment.");
    }

    // Create mint for BTCMiner token
    console.log("\n📝 Creating BTCMiner SPL Token...");
    const mint = await createMint(
      provider.connection,
      authority.payer,
      authority.publicKey, // mint authority
      null, // freeze authority (none)
      9 // decimals
    );
    console.log("✅ Mint created:", mint.toString());

    // Find config PDA
    const [config, configBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );
    console.log("Config PDA:", config.toString());

    // Get authority token account
    const authorityTokenAccount = await getAssociatedTokenAddress(
      mint,
      authority.publicKey
    );
    console.log("Authority token account:", authorityTokenAccount.toString());

    // Initialize the program
    console.log("\n🚀 Initializing BTCMiner Program...");
    const initialSupply = new anchor.BN(100_000_000 * 10**9); // 100M tokens with 9 decimals
    
    const tx = await program.methods
      .initialize(wormholeBridge, initialSupply)
      .accounts({
        config,
        mint,
        authorityTokenAccount,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Program initialized!");
    console.log("Transaction signature:", tx);

    // Verify initialization
    const configAccount = await program.account.config.fetch(config);
    console.log("\n📊 Program Configuration:");
    console.log("Authority:", configAccount.authority.toString());
    console.log("Wormhole Bridge:", configAccount.wormholeBridge.toString());
    console.log("Total Burned:", configAccount.totalBurned.toString());
    console.log("Total Minted:", configAccount.totalMinted.toString());
    console.log("Daily Burn Limit:", configAccount.dailyBurnLimit.toString());
    console.log("Paused:", configAccount.paused);

    // Save deployment info
    const deploymentInfo: SolanaDeploymentInfo = {
      network,
      programId: program.programId.toString(),
      mintAddress: mint.toString(),
      configAddress: config.toString(),
      authorityTokenAccount: authorityTokenAccount.toString(),
      authority: authority.publicKey.toString(),
      wormholeBridge: wormholeBridge.toString(),
      initialSupply: initialSupply.toString(),
      timestamp: new Date().toISOString()
    };

    const deploymentsFile = "solana-deployments.json";
    let existingDeployments: SolanaDeploymentInfo[] = [];
    
    if (fs.existsSync(deploymentsFile)) {
      const fileContent = fs.readFileSync(deploymentsFile, "utf8");
      existingDeployments = JSON.parse(fileContent);
    }

    // Update or add new deployment
    const existingIndex = existingDeployments.findIndex(d => d.network === network);
    if (existingIndex >= 0) {
      existingDeployments[existingIndex] = deploymentInfo;
    } else {
      existingDeployments.push(deploymentInfo);
    }

    fs.writeFileSync(deploymentsFile, JSON.stringify(existingDeployments, null, 2));
    console.log(`\n💾 Deployment info saved to ${deploymentsFile}`);

    console.log("\n🎉 Solana Deployment Summary:");
    console.log("=============================");
    console.log(`Network: ${network}`);
    console.log(`Program ID: ${program.programId.toString()}`);
    console.log(`Mint Address: ${mint.toString()}`);
    console.log(`Config Address: ${config.toString()}`);
    console.log(`Initial Supply: ${(Number(initialSupply) / 10**9).toLocaleString()} BTCM`);

    console.log("\n📋 Next Steps:");
    console.log("1. Test cross-chain burn functionality");
    console.log("2. Set up Wormhole message handling");
    console.log("3. Configure cross-chain communication with EVM chains");
    console.log("4. Deploy frontend integration for Solana wallet support");
    
    console.log("\n✨ Solana deployment complete! Ready for cross-chain magic! 🌉");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });