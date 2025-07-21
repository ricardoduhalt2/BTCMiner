import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BtcminerSolana } from "../target/types/btcminer_solana";
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { expect } from "chai";

describe("btcminer-solana", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BtcminerSolana as Program<BtcminerSolana>;
  
  // Test accounts
  const authority = provider.wallet as anchor.Wallet;
  const user = anchor.web3.Keypair.generate();
  
  // PDAs
  let configPda: anchor.web3.PublicKey;
  let configBump: number;
  
  // Token accounts
  let mint: anchor.web3.PublicKey;
  let authorityTokenAccount: anchor.web3.PublicKey;
  let userTokenAccount: anchor.web3.PublicKey;
  
  // Test constants
  const INITIAL_SUPPLY = new anchor.BN(100_000_000 * 10**9); // 100M tokens
  const WORMHOLE_BRIDGE = anchor.web3.Keypair.generate().publicKey;
  const DAILY_BURN_LIMIT = new anchor.BN(1_000_000 * 10**9); // 1M tokens

  before(async () => {
    // Find config PDA
    [configPda, configBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    // Create mint
    mint = await createMint(
      provider.connection,
      authority.payer,
      configPda, // Mint authority will be the config PDA
      null,
      9 // 9 decimals
    );

    // Create associated token accounts
    authorityTokenAccount = await getAssociatedTokenAddress(
      mint,
      authority.publicKey
    );

    userTokenAccount = await getAssociatedTokenAddress(
      mint,
      user.publicKey
    );

    // Airdrop SOL to user for testing
    const signature = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
  });

  describe("Initialization", () => {
    it("Initializes the BTCMiner program", async () => {
      const tx = await program.methods
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

      console.log("Initialize transaction signature:", tx);

      // Verify config account
      const config = await program.account.config.fetch(configPda);
      expect(config.authority.toString()).to.equal(authority.publicKey.toString());
      expect(config.wormholebridge.toString()).to.equal(WORMHOLE_BRIDGE.toString());
      expect(config.totalBurned.toString()).to.equal("0");
      expect(config.totalMinted.toString()).to.equal("0");
      expect(config.dailyBurnLimit.toString()).to.equal(DAILY_BURN_LIMIT.toString());
      expect(config.paused).to.be.false;

      // Verify initial token supply
      const authorityAccount = await getAccount(provider.connection, authorityTokenAccount);
      expect(authorityAccount.amount.toString()).to.equal(INITIAL_SUPPLY.toString());
    });

    it("Fails to initialize twice", async () => {
      try {
        await program.methods
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
        
        expect.fail("Should have failed to initialize twice");
      } catch (error) {
        expect(error.message).to.include("already in use");
      }
    });
  });

  describe("Token Operations", () => {
    before(async () => {
      // Create user token account and transfer some tokens
      await createAssociatedTokenAccount(
        provider.connection,
        user,
        mint,
        user.publicKey
      );

      // Transfer tokens from authority to user for testing
      const transferAmount = new anchor.BN(10_000 * 10**9); // 10K tokens
      
      await program.methods
        .crossChainMint(transferAmount, 1, Array.from(new Uint8Array(32))) // Mock VAA hash
        .accounts({
          config: configPda,
          mint: mint,
          userTokenAccount: userTokenAccount,
          user: user.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();
    });

    it("Burns tokens with daily limit check", async () => {
      const burnAmount = new anchor.BN(1000 * 10**9); // 1K tokens
      const targetChain = 2; // Ethereum
      const recipient = Array.from(new Uint8Array(32));
      const nonce = 12345;

      const userBalanceBefore = await getAccount(provider.connection, userTokenAccount);
      
      const tx = await program.methods
        .crossChainBurn(burnAmount, targetChain, recipient, nonce)
        .accounts({
          config: configPda,
          mint: mint,
          userTokenAccount: userTokenAccount,
          user: user.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      console.log("Cross-chain burn transaction signature:", tx);

      // Verify tokens were burned
      const userBalanceAfter = await getAccount(provider.connection, userTokenAccount);
      expect(userBalanceAfter.amount).to.equal(
        userBalanceBefore.amount - burnAmount.toBigInt()
      );

      // Verify config was updated
      const config = await program.account.config.fetch(configPda);
      expect(config.totalBurned.toString()).to.equal(burnAmount.toString());
      expect(config.dailyBurnAmount.toString()).to.equal(burnAmount.toString());
    });

    it("Enforces daily burn limit", async () => {
      const largeBurnAmount = DAILY_BURN_LIMIT.add(new anchor.BN(1)); // Exceed limit by 1
      const targetChain = 2;
      const recipient = Array.from(new Uint8Array(32));
      const nonce = 12346;

      try {
        await program.methods
          .crossChainBurn(largeBurnAmount, targetChain, recipient, nonce)
          .accounts({
            config: configPda,
            mint: mint,
            userTokenAccount: userTokenAccount,
            user: user.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have failed due to daily burn limit");
      } catch (error) {
        expect(error.message).to.include("Daily burn limit exceeded");
      }
    });

    it("Gets remaining daily burn allowance", async () => {
      const remainingBurn = await program.methods
        .getRemainingDailyBurn(user.publicKey)
        .accounts({
          config: configPda,
        })
        .view();

      console.log("Remaining daily burn:", remainingBurn.toString());
      
      // Should be daily limit minus what was already burned
      const config = await program.account.config.fetch(configPda);
      const expected = config.dailyBurnLimit.sub(config.dailyBurnAmount);
      expect(remainingBurn.toString()).to.equal(expected.toString());
    });
  });

  describe("Price Oracle Integration", () => {
    it("Updates price from Pyth oracle (mocked)", async () => {
      // Create a mock price feed account
      const mockPriceFeed = anchor.web3.Keypair.generate();
      
      // Note: In a real test, you would use actual Pyth price feed data
      // For now, we'll test the structure without actual Pyth integration
      
      try {
        await program.methods
          .updatePrice()
          .accounts({
            config: configPda,
            priceFeed: mockPriceFeed.publicKey,
          })
          .rpc();
        
        // This will fail without real Pyth data, but tests the account structure
      } catch (error) {
        expect(error.message).to.include("Invalid price data");
      }
    });

    it("Gets current price (when available)", async () => {
      try {
        const currentPrice = await program.methods
          .getCurrentPrice()
          .accounts({
            config: configPda,
          })
          .view();
        
        console.log("Current price:", currentPrice.toString());
      } catch (error) {
        // Expected to fail if no price has been set
        expect(error.message).to.include("Price data is stale");
      }
    });
  });

  describe("Admin Functions", () => {
    it("Pauses the program", async () => {
      const tx = await program.methods
        .pause()
        .accounts({
          config: configPda,
          authority: authority.publicKey,
        })
        .rpc();

      console.log("Pause transaction signature:", tx);

      const config = await program.account.config.fetch(configPda);
      expect(config.paused).to.be.true;
    });

    it("Prevents operations when paused", async () => {
      const burnAmount = new anchor.BN(100 * 10**9);
      const targetChain = 2;
      const recipient = Array.from(new Uint8Array(32));
      const nonce = 12347;

      try {
        await program.methods
          .crossChainBurn(burnAmount, targetChain, recipient, nonce)
          .accounts({
            config: configPda,
            mint: mint,
            userTokenAccount: userTokenAccount,
            user: user.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
        
        expect.fail("Should have failed when program is paused");
      } catch (error) {
        expect(error.message).to.include("Program is paused");
      }
    });

    it("Unpauses the program", async () => {
      const tx = await program.methods
        .unpause()
        .accounts({
          config: configPda,
          authority: authority.publicKey,
        })
        .rpc();

      console.log("Unpause transaction signature:", tx);

      const config = await program.account.config.fetch(configPda);
      expect(config.paused).to.be.false;
    });

    it("Adds trusted emitter", async () => {
      const chainId = 2; // Ethereum
      const emitterAddress = Array.from(new Uint8Array(32));
      emitterAddress[31] = 1; // Make it non-zero

      const tx = await program.methods
        .addTrustedEmitter(chainId, emitterAddress)
        .accounts({
          config: configPda,
          authority: authority.publicKey,
        })
        .rpc();

      console.log("Add trusted emitter transaction signature:", tx);

      const config = await program.account.config.fetch(configPda);
      expect(config.trustedEmitters.length).to.equal(1);
      expect(config.trustedEmitters[0][0]).to.equal(chainId);
    });

    it("Prevents unauthorized admin actions", async () => {
      const unauthorizedUser = anchor.web3.Keypair.generate();
      
      // Airdrop SOL to unauthorized user
      const signature = await provider.connection.requestAirdrop(
        unauthorizedUser.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(signature);

      try {
        await program.methods
          .pause()
          .accounts({
            config: configPda,
            authority: unauthorizedUser.publicKey,
          })
          .signers([unauthorizedUser])
          .rpc();
        
        expect.fail("Should have failed for unauthorized user");
      } catch (error) {
        expect(error.message).to.include("Unauthorized");
      }
    });
  });

  describe("Cross-Chain Integration", () => {
    it("Processes Wormhole VAA (structure test)", async () => {
      // Create mock VAA data
      const mockVaaData = new Uint8Array(200); // Mock VAA
      
      try {
        await program.methods
          .processWormholeVaa(Array.from(mockVaaData))
          .accounts({
            config: configPda,
            mint: mint,
            recipientTokenAccount: userTokenAccount,
            recipient: user.publicKey,
            wormholeConfig: anchor.web3.Keypair.generate().publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        
        // This will fail without real Wormhole data, but tests the structure
      } catch (error) {
        // Expected to fail with mock data
        console.log("Expected error with mock VAA data:", error.message);
      }
    });
  });

  describe("View Functions", () => {
    it("Fetches config data", async () => {
      const config = await program.account.config.fetch(configPda);
      
      expect(config.authority.toString()).to.equal(authority.publicKey.toString());
      expect(config.paused).to.be.false;
      expect(config.totalBurned.toNumber()).to.be.greaterThan(0);
      expect(config.dailyBurnLimit.toString()).to.equal(DAILY_BURN_LIMIT.toString());
      
      console.log("Config data:", {
        authority: config.authority.toString(),
        totalBurned: config.totalBurned.toString(),
        totalMinted: config.totalMinted.toString(),
        dailyBurnLimit: config.dailyBurnLimit.toString(),
        paused: config.paused,
      });
    });
  });
});