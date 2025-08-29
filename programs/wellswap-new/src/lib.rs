use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod wellswap_new {
    use super::*;

    // 보험 자산 등록 (USDT 결제)
    pub fn register_insurance_asset(
        ctx: Context<RegisterInsuranceAsset>,
        asset_data: InsuranceAssetData,
        registration_fee: u64,
    ) -> Result<()> {
        let insurance_asset = &mut ctx.accounts.insurance_asset;
        
        // 등록비 지불 확인 (USDT)
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
        
        emit!(InsuranceAssetRegistered {
            asset: insurance_asset.key(),
            owner: insurance_asset.owner,
            insurance_company: asset_data.insurance_company.clone(),
            registration_fee,
        });
        
        Ok(())
    }

    // 보험 자산 구매 (USDT 결제)
    pub fn purchase_insurance_asset(
        ctx: Context<PurchaseInsuranceAsset>,
        purchase_price: u64,
    ) -> Result<()> {
        let insurance_asset = &mut ctx.accounts.insurance_asset;
        
        // 판매 중인지 확인
        require!(insurance_asset.is_for_sale, WellswapError::AssetNotForSale);
        
        // 구매자에게 자산 소유권 이전
        let previous_owner = insurance_asset.owner;
        insurance_asset.owner = ctx.accounts.buyer.key();
        insurance_asset.is_for_sale = false;
        
        // 판매자에게 대금 지불 (USDT)
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, purchase_price)?;
        
        emit!(InsuranceAssetPurchased {
            asset: insurance_asset.key(),
            previous_owner,
            new_owner: insurance_asset.owner,
            purchase_price,
        });
        
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
        
        emit!(MultisigTradeCreated {
            trade: multisig_trade.key(),
            asset_id,
            initiator: multisig_trade.initiator,
            trade_amount,
        });
        
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
        
        emit!(MultisigTradeApproved {
            trade: multisig_trade.key(),
            approver: ctx.accounts.approver.key(),
            approvers_count: multisig_trade.approvers.len(),
            status: multisig_trade.status.clone(),
        });
        
        Ok(())
    }

    // 보험 자산 판매 등록
    pub fn list_insurance_asset_for_sale(
        ctx: Context<ListInsuranceAssetForSale>,
        sale_price: u64,
    ) -> Result<()> {
        let insurance_asset = &mut ctx.accounts.insurance_asset;
        
        // 소유자 확인
        require!(insurance_asset.owner == ctx.accounts.owner.key(), WellswapError::NotOwner);
        
        insurance_asset.is_for_sale = true;
        insurance_asset.sale_price = Some(sale_price);
        
        emit!(InsuranceAssetListedForSale {
            asset: insurance_asset.key(),
            owner: insurance_asset.owner,
            sale_price,
        });
        
        Ok(())
    }

    // 보험 자산 판매 취소
    pub fn cancel_insurance_asset_sale(
        ctx: Context<CancelInsuranceAssetSale>,
    ) -> Result<()> {
        let insurance_asset = &mut ctx.accounts.insurance_asset;
        
        // 소유자 확인
        require!(insurance_asset.owner == ctx.accounts.owner.key(), WellswapError::NotOwner);
        
        insurance_asset.is_for_sale = false;
        insurance_asset.sale_price = None;
        
        emit!(InsuranceAssetSaleCancelled {
            asset: insurance_asset.key(),
            owner: insurance_asset.owner,
        });
        
        Ok(())
    }
}

// Accounts 구조체들
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
    
    pub initiator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveMultisigTrade<'info> {
    #[account(mut)]
    pub multisig_trade: Account<'info, MultisigTrade>,
    
    pub approver: Signer<'info>,
}

#[derive(Accounts)]
pub struct ListInsuranceAssetForSale<'info> {
    #[account(mut)]
    pub insurance_asset: Account<'info, InsuranceAsset>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelInsuranceAssetSale<'info> {
    #[account(mut)]
    pub insurance_asset: Account<'info, InsuranceAsset>,
    
    pub owner: Signer<'info>,
}

// Account 구조체들
#[account]
#[derive(InitSpace)]
pub struct InsuranceAsset {
    pub owner: Pubkey,
    pub insurance_company: String,
    pub product_category: String,
    pub product_name: String,
    pub contract_date: i64,
    pub contract_period: u32,
    pub paid_period: u32,
    pub annual_premium: u64,
    pub total_paid: u64,
    pub is_for_sale: bool,
    pub sale_price: Option<u64>,
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

// Enum들
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum TradeStatus {
    Pending,
    Approved,
    Rejected,
    Completed,
}

// 데이터 구조체
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InsuranceAssetData {
    pub insurance_company: String,
    pub product_category: String,
    pub product_name: String,
    pub contract_date: i64,
    pub contract_period: u32,
    pub paid_period: u32,
    pub annual_premium: u64,
    pub total_paid: u64,
}

// Error enum
#[error_code]
pub enum WellswapError {
    #[msg("Asset is not for sale")]
    AssetNotForSale,
    #[msg("Not the owner")]
    NotOwner,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Invalid trade amount")]
    InvalidTradeAmount,
}

// Events
#[event]
pub struct InsuranceAssetRegistered {
    pub asset: Pubkey,
    pub owner: Pubkey,
    pub insurance_company: String,
    pub registration_fee: u64,
}

#[event]
pub struct InsuranceAssetPurchased {
    pub asset: Pubkey,
    pub previous_owner: Pubkey,
    pub new_owner: Pubkey,
    pub purchase_price: u64,
}

#[event]
pub struct MultisigTradeCreated {
    pub trade: Pubkey,
    pub asset_id: u64,
    pub initiator: Pubkey,
    pub trade_amount: u64,
}

#[event]
pub struct MultisigTradeApproved {
    pub trade: Pubkey,
    pub approver: Pubkey,
    pub approvers_count: usize,
    pub status: TradeStatus,
}

#[event]
pub struct InsuranceAssetListedForSale {
    pub asset: Pubkey,
    pub owner: Pubkey,
    pub sale_price: u64,
}

#[event]
pub struct InsuranceAssetSaleCancelled {
    pub asset: Pubkey,
    pub owner: Pubkey,
}
