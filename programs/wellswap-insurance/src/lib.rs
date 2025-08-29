use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod wellswap_insurance {
    use super::*;

    // 보험 자산 등록
    pub fn register_insurance_asset(
        ctx: Context<RegisterInsuranceAsset>,
        asset_data: InsuranceAssetData,
        registration_fee: u64,
    ) -> Result<()> {
        let insurance_asset = &mut ctx.accounts.insurance_asset;
        
        // 등록비 지불 확인
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.platform_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, registration_fee)?;
        
        // 보험 자산 정보 저장
        insurance_asset.owner = ctx.accounts.user.key();
        insurance_asset.insurance_company = asset_data.insurance_company;
        insurance_asset.product_category = asset_data.product_category;
        insurance_asset.product_name = asset_data.product_name;
        insurance_asset.contract_date = asset_data.contract_date;
        insurance_asset.contract_period = asset_data.contract_period;
        insurance_asset.paid_period = asset_data.paid_period;
        insurance_asset.annual_premium = asset_data.annual_premium;
        insurance_asset.total_paid = asset_data.total_paid;
        insurance_asset.is_for_sale = true;
        insurance_asset.registration_fee = registration_fee;
        insurance_asset.created_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // 보험 자산 구매
    pub fn purchase_insurance_asset(
        ctx: Context<PurchaseInsuranceAsset>,
        purchase_price: u64,
    ) -> Result<()> {
        let insurance_asset = &mut ctx.accounts.insurance_asset;
        
        // 판매 중인지 확인
        require!(insurance_asset.is_for_sale, WellswapError::AssetNotForSale);
        
        // 구매자에게 자산 소유권 이전
        insurance_asset.owner = ctx.accounts.buyer.key();
        insurance_asset.is_for_sale = false;
        
        // 판매자에게 대금 지불
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, purchase_price)?;
        
        Ok(())
    }

    // 멀티시그 거래 생성
    pub fn create_multisig_trade(
        ctx: Context<CreateMultisigTrade>,
        asset_id: u64,
        trade_amount: u64,
    ) -> Result<()> {
        let multisig_trade = &mut ctx.accounts.multisig_trade;
        
        // 멀티시그 거래 정보 저장
        multisig_trade.asset_id = asset_id;
        multisig_trade.initiator = ctx.accounts.initiator.key();
        multisig_trade.trade_amount = trade_amount;
        multisig_trade.status = TradeStatus::Pending;
        multisig_trade.created_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // 멀티시그 거래 승인
    pub fn approve_multisig_trade(
        ctx: Context<ApproveMultisigTrade>,
    ) -> Result<()> {
        let multisig_trade = &mut ctx.accounts.multisig_trade;
        
        // 승인자 추가
        if !multisig_trade.approvers.contains(&ctx.accounts.approver.key()) {
            multisig_trade.approvers.push(ctx.accounts.approver.key());
        }
        
        // 임계값 확인 (2/3 승인)
        if multisig_trade.approvers.len() >= 2 {
            multisig_trade.status = TradeStatus::Approved;
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RegisterInsuranceAsset<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + InsuranceAsset::INIT_SPACE,
        seeds = [b"insurance_asset", user.key().as_ref()],
        bump
    )]
    pub insurance_asset: Account<'info, InsuranceAsset>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub platform_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseInsuranceAsset<'info> {
    #[account(mut)]
    pub insurance_asset: Account<'info, InsuranceAsset>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateMultisigTrade<'info> {
    #[account(
        init,
        payer = initiator,
        space = 8 + MultisigTrade::INIT_SPACE,
        seeds = [b"multisig_trade", initiator.key().as_ref()],
        bump
    )]
    pub multisig_trade: Account<'info, MultisigTrade>,
    
    #[account(mut)]
    pub initiator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveMultisigTrade<'info> {
    #[account(mut)]
    pub multisig_trade: Account<'info, MultisigTrade>,
    
    pub approver: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct InsuranceAsset {
    pub owner: Pubkey,
    pub insurance_company: String,
    pub product_category: String,
    pub product_name: String,
    pub contract_date: i64,
    pub contract_period: String,
    pub paid_period: String,
    pub annual_premium: u64,
    pub total_paid: u64,
    pub is_for_sale: bool,
    pub registration_fee: u64,
    pub created_at: i64,
}

#[account]
#[derive(InitSpace)]
pub struct MultisigTrade {
    pub asset_id: u64,
    pub initiator: Pubkey,
    pub trade_amount: u64,
    pub status: TradeStatus,
    pub approvers: Vec<Pubkey>,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum TradeStatus {
    Pending,
    Approved,
    Rejected,
    Completed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct InsuranceAssetData {
    pub insurance_company: String,
    pub product_category: String,
    pub product_name: String,
    pub contract_date: i64,
    pub contract_period: String,
    pub paid_period: String,
    pub annual_premium: u64,
    pub total_paid: u64,
}

#[error_code]
pub enum WellswapError {
    #[msg("Asset is not for sale")]
    AssetNotForSale,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid trade status")]
    InvalidTradeStatus,
}
