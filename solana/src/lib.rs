use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo, Burn};
use anchor_spl::associated_token::AssociatedToken;
use wormhole_anchor_sdk::{wormhole, token_bridge};
use pyth_sdk_solana::{load_price_feed_from_account_info, PriceFeed};

declare_id!("BTCMinerSoLaNa11111111111111111111111111111");

#[program]
pub mod btcminer_solana {
    use super::*;

    /// Initialize the BTCMiner program
    pub fn initialize(
        ctx: Context<Initialize>,
        wormhole_bridge: Pubkey,
        initial_supply: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.wormhole_bridge = wormhole_bridge;
        config.total_burned = 0;
        config.total_minted = 0;
        config.daily_burn_limit = 1_000_000 * 10_u64.pow(9); // 1M tokens with 9 decimals
        config.bump = ctx.bumps.config;

        // Mint initial supply to authority
        if initial_supply > 0 {
            token::mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    MintTo {
                        mint: ctx.accounts.mint.to_account_info(),
                        to: ctx.accounts.authority_token_account.to_account_info(),
                        authority: config.to_account_info(),
                    },
                    &[&[b"config", &[config.bump]]],
                ),
                initial_supply,
            )?;
        }

        msg!("BTCMiner Solana program initialized with supply: {}", initial_supply);
        Ok(())
    }

    /// Burn tokens and initiate cross-chain transfer
    pub fn cross_chain_burn(
        ctx: Context<CrossChainTransfer>,
        amount: u64,
        target_chain: u16,
        recipient: [u8; 32],
        nonce: u32,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        
        // Check daily burn limit
        let current_time = Clock::get()?.unix_timestamp as u64;
        if current_time >= config.last_burn_reset + 86400 {
            config.daily_burn_amount = 0;
            config.last_burn_reset = current_time;
        }
        
        require!(
            config.daily_burn_amount + amount <= config.daily_burn_limit,
            BTCMinerError::DailyBurnLimitExceeded
        );

        // Burn tokens
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update tracking
        config.total_burned += amount;
        config.daily_burn_amount += amount;

        // Prepare Wormhole message
        let message = CrossChainMessage {
            action: 1, // Burn action
            amount,
            recipient,
            source_chain: 1, // Solana Wormhole chain ID
            target_chain,
            nonce,
        };

        let message_data = message.try_to_vec()?;

        // Send Wormhole message (simplified - actual implementation would use Wormhole CPI)
        msg!("Cross-chain burn initiated: {} tokens to chain {}", amount, target_chain);
        
        emit!(CrossChainBurnEvent {
            user: ctx.accounts.user.key(),
            amount,
            target_chain,
            recipient,
            nonce,
        });

        Ok(())
    }

    /// Mint tokens from cross-chain transfer
    pub fn cross_chain_mint(
        ctx: Context<CrossChainTransfer>,
        amount: u64,
        source_chain: u16,
        vaa_hash: [u8; 32],
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        
        // Verify VAA hasn't been processed (simplified)
        require!(
            !config.processed_vaas.contains(&vaa_hash),
            BTCMinerError::VAAAlreadyProcessed
        );

        // Mint tokens to user
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: config.to_account_info(),
                },
                &[&[b"config", &[config.bump]]],
            ),
            amount,
        )?;

        // Update tracking
        config.total_minted += amount;
        config.processed_vaas.push(vaa_hash);

        msg!("Cross-chain mint completed: {} tokens from chain {}", amount, source_chain);
        
        emit!(CrossChainMintEvent {
            user: ctx.accounts.user.key(),
            amount,
            source_chain,
            vaa_hash,
        });

        Ok(())
    }

    /// Get user's remaining daily burn allowance
    pub fn get_remaining_daily_burn(ctx: Context<ViewConfig>, user: Pubkey) -> Result<u64> {
        let config = &ctx.accounts.config;
        
        // Reset if new day
        let current_time = Clock::get()?.unix_timestamp as u64;
        let daily_burn = if current_time >= config.last_burn_reset + 86400 {
            0
        } else {
            config.daily_burn_amount
        };

        let remaining = config.daily_burn_limit.saturating_sub(daily_burn);
        msg!("Remaining daily burn for {}: {}", user, remaining);
        Ok(remaining)
    }

    /// Emergency pause (admin only)
    pub fn pause(ctx: Context<AdminAction>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.paused = true;
        msg!("BTCMiner program paused");
        Ok(())
    }

    /// Emergency unpause (admin only)
    pub fn unpause(ctx: Context<AdminAction>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.paused = false;
        msg!("BTCMiner program unpaused");
        Ok(())
    }

    /// Update price from Pyth oracle
    pub fn update_price(ctx: Context<UpdatePrice>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let price_account_info = &ctx.accounts.price_feed;
        
        // Load price feed from Pyth
        let price_feed = load_price_feed_from_account_info(price_account_info)?;
        let current_price = price_feed.get_current_price()
            .ok_or(BTCMinerError::InvalidPriceData)?;
        
        // Update config with new price
        config.current_price = current_price.price as u64;
        config.price_confidence = current_price.conf as u64;
        config.price_timestamp = Clock::get()?.unix_timestamp as u64;
        
        msg!("Price updated: {} with confidence: {}", current_price.price, current_price.conf);
        
        emit!(PriceUpdateEvent {
            price: current_price.price as u64,
            confidence: current_price.conf as u64,
            timestamp: config.price_timestamp,
        });
        
        Ok(())
    }

    /// Send Wormhole message for cross-chain transfer
    pub fn send_wormhole_message(
        ctx: Context<SendWormholeMessage>,
        message: CrossChainMessage,
    ) -> Result<()> {
        let config = &ctx.accounts.config;
        
        // Serialize message
        let message_data = message.try_to_vec()?;
        
        // Send via Wormhole
        wormhole::post_message(
            CpiContext::new_with_signer(
                ctx.accounts.wormhole_program.to_account_info(),
                wormhole::PostMessage {
                    config: ctx.accounts.wormhole_config.to_account_info(),
                    message: ctx.accounts.wormhole_message.to_account_info(),
                    emitter: ctx.accounts.wormhole_emitter.to_account_info(),
                    sequence: ctx.accounts.wormhole_sequence.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    fee_collector: ctx.accounts.wormhole_fee_collector.to_account_info(),
                    clock: ctx.accounts.clock.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                },
                &[&[b"config", &[config.bump]]],
            ),
            message.nonce,
            message_data,
            wormhole::Finality::Confirmed,
        )?;
        
        msg!("Wormhole message sent for cross-chain transfer");
        Ok(())
    }

    /// Process incoming Wormhole VAA
    pub fn process_wormhole_vaa(
        ctx: Context<ProcessWormholeVAA>,
        vaa_data: Vec<u8>,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        
        // Verify and parse VAA
        let vaa = wormhole::parse_and_verify_vaa(&ctx.accounts.wormhole_config, &vaa_data)?;
        
        // Check if VAA is from trusted emitter
        require!(
            config.trusted_emitters.contains(&(vaa.emitter_chain, vaa.emitter_address)),
            BTCMinerError::UntrustedEmitter
        );
        
        // Check if VAA hasn't been processed
        let vaa_hash = wormhole::vaa_hash(&vaa_data);
        require!(
            !config.processed_vaas.contains(&vaa_hash),
            BTCMinerError::VAAAlreadyProcessed
        );
        
        // Parse cross-chain message
        let message: CrossChainMessage = CrossChainMessage::try_from_slice(&vaa.payload)?;
        
        // Process based on action
        match message.action {
            2 => {
                // Mint action
                token::mint_to(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        MintTo {
                            mint: ctx.accounts.mint.to_account_info(),
                            to: ctx.accounts.recipient_token_account.to_account_info(),
                            authority: config.to_account_info(),
                        },
                        &[&[b"config", &[config.bump]]],
                    ),
                    message.amount,
                )?;
                
                config.total_minted += message.amount;
                
                emit!(CrossChainMintEvent {
                    user: Pubkey::try_from(message.recipient)?,
                    amount: message.amount,
                    source_chain: message.source_chain,
                    vaa_hash,
                });
            }
            _ => return Err(BTCMinerError::InvalidMessage.into()),
        }
        
        // Mark VAA as processed
        config.processed_vaas.push(vaa_hash);
        
        Ok(())
    }

    /// Add trusted emitter for cross-chain messages
    pub fn add_trusted_emitter(
        ctx: Context<AdminAction>,
        chain_id: u16,
        emitter_address: [u8; 32],
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.trusted_emitters.push((chain_id, emitter_address));
        
        msg!("Added trusted emitter for chain {}", chain_id);
        Ok(())
    }

    /// Get current token price from oracle
    pub fn get_current_price(ctx: Context<ViewConfig>) -> Result<u64> {
        let config = &ctx.accounts.config;
        
        // Check if price is stale (older than 5 minutes)
        let current_time = Clock::get()?.unix_timestamp as u64;
        require!(
            current_time - config.price_timestamp < 300,
            BTCMinerError::StalePriceData
        );
        
        Ok(config.current_price)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = authority
    )]
    pub authority_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CrossChainTransfer<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        constraint = !config.paused @ BTCMinerError::ProgramPaused
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ViewConfig<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.authority == authority.key() @ BTCMinerError::Unauthorized
    )]
    pub config: Account<'info, Config>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdatePrice<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    /// CHECK: Pyth price feed account
    pub price_feed: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SendWormholeMessage<'info> {
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: Wormhole program
    pub wormhole_program: AccountInfo<'info>,
    
    /// CHECK: Wormhole config
    pub wormhole_config: AccountInfo<'info>,
    
    /// CHECK: Wormhole message account
    #[account(mut)]
    pub wormhole_message: AccountInfo<'info>,
    
    /// CHECK: Wormhole emitter
    pub wormhole_emitter: AccountInfo<'info>,
    
    /// CHECK: Wormhole sequence
    #[account(mut)]
    pub wormhole_sequence: AccountInfo<'info>,
    
    /// CHECK: Wormhole fee collector
    #[account(mut)]
    pub wormhole_fee_collector: AccountInfo<'info>,
    
    pub clock: Sysvar<'info, Clock>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessWormholeVAA<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = recipient
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Recipient of the tokens
    pub recipient: AccountInfo<'info>,
    
    /// CHECK: Wormhole config
    pub wormhole_config: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub authority: Pubkey,
    pub wormhole_bridge: Pubkey,
    pub total_burned: u64,
    pub total_minted: u64,
    pub daily_burn_limit: u64,
    pub daily_burn_amount: u64,
    pub last_burn_reset: u64,
    pub current_price: u64,
    pub price_confidence: u64,
    pub price_timestamp: u64,
    pub paused: bool,
    pub bump: u8,
    #[max_len(1000)]
    pub processed_vaas: Vec<[u8; 32]>,
    #[max_len(50)]
    pub trusted_emitters: Vec<(u16, [u8; 32])>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CrossChainMessage {
    pub action: u8, // 1 = burn, 2 = mint
    pub amount: u64,
    pub recipient: [u8; 32],
    pub source_chain: u16,
    pub target_chain: u16,
    pub nonce: u32,
}

#[event]
pub struct CrossChainBurnEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub target_chain: u16,
    pub recipient: [u8; 32],
    pub nonce: u32,
}

#[event]
pub struct CrossChainMintEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub source_chain: u16,
    pub vaa_hash: [u8; 32],
}

#[event]
pub struct PriceUpdateEvent {
    pub price: u64,
    pub confidence: u64,
    pub timestamp: u64,
}

#[error_code]
pub enum BTCMinerError {
    #[msg("Daily burn limit exceeded")]
    DailyBurnLimitExceeded,
    #[msg("VAA already processed")]
    VAAAlreadyProcessed,
    #[msg("Program is paused")]
    ProgramPaused,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid cross-chain message")]
    InvalidMessage,
    #[msg("Invalid price data from oracle")]
    InvalidPriceData,
    #[msg("Price data is stale")]
    StalePriceData,
    #[msg("Untrusted emitter")]
    UntrustedEmitter,
}