import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { IDL } from '../target/types/wellswap_insurance';

export class SolanaClient {
  private connection: Connection;
  private provider: AnchorProvider;
  private program: Program;
  private usdtMint: PublicKey;

  constructor() {
    // Devnet 연결
    this.connection = new Connection(
      'https://api.devnet.solana.com',
      'confirmed'
    );

    // USDT Devnet Mint Address
    this.usdtMint = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');

    // Provider 설정 (지갑 연결 후 설정)
    this.provider = {} as AnchorProvider;
    this.program = {} as Program;
  }

  // 지갑 연결 및 Provider 설정
  async connectWallet(wallet: any) {
    this.provider = new AnchorProvider(
      this.connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    this.program = new Program(IDL, new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'), this.provider);
  }

  // USDT 토큰 계정 생성
  async createTokenAccount(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    const associatedTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint,
      owner
    );

    const transaction = new Transaction().add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        associatedTokenAccount,
        owner,
        this.provider.wallet.publicKey
      )
    );

    await sendAndConfirmTransaction(this.connection, transaction, [this.provider.wallet]);
    return associatedTokenAccount;
  }

  // 보험 자산 등록
  async registerInsuranceAsset(
    assetData: {
      insuranceCompany: string;
      productCategory: string;
      productName: string;
      contractDate: number;
      contractPeriod: string;
      paidPeriod: string;
      annualPremium: number;
      totalPaid: number;
    },
    registrationFee: number
  ) {
    const user = this.provider.wallet.publicKey;
    
    // 보험 자산 계정 PDA 생성
    const [insuranceAssetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('insurance_asset'), user.toBuffer()],
      this.program.programId
    );

    // 사용자 USDT 계정
    const userTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      this.usdtMint,
      user
    );

    // 플랫폼 USDT 계정 (관리자 계정)
    const platformTokenAccount = new PublicKey('YOUR_PLATFORM_TOKEN_ACCOUNT');

    try {
      const tx = await this.program.methods
        .registerInsuranceAsset(
          {
            insuranceCompany: assetData.insuranceCompany,
            productCategory: assetData.productCategory,
            productName: assetData.productName,
            contractDate: new BN(assetData.contractDate),
            contractPeriod: assetData.contractPeriod,
            paidPeriod: assetData.paidPeriod,
            annualPremium: new BN(assetData.annualPremium * 1e6), // USDT 6 decimals
            totalPaid: new BN(assetData.totalPaid * 1e6),
          },
          new BN(registrationFee * 1e6)
        )
        .accounts({
          insuranceAsset: insuranceAssetPda,
          user: user,
          userTokenAccount: userTokenAccount,
          platformTokenAccount: platformTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      return { success: true, transactionHash: tx };
    } catch (error) {
      console.error('보험 자산 등록 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 보험 자산 구매
  async purchaseInsuranceAsset(
    insuranceAssetAddress: PublicKey,
    sellerTokenAccount: PublicKey,
    purchasePrice: number
  ) {
    const buyer = this.provider.wallet.publicKey;
    
    // 구매자 USDT 계정
    const buyerTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      this.usdtMint,
      buyer
    );

    try {
      const tx = await this.program.methods
        .purchaseInsuranceAsset(new BN(purchasePrice * 1e6))
        .accounts({
          insuranceAsset: insuranceAssetAddress,
          buyer: buyer,
          buyerTokenAccount: buyerTokenAccount,
          sellerTokenAccount: sellerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return { success: true, transactionHash: tx };
    } catch (error) {
      console.error('보험 자산 구매 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 멀티시그 거래 생성
  async createMultisigTrade(assetId: number, tradeAmount: number) {
    const initiator = this.provider.wallet.publicKey;
    
    // 멀티시그 거래 계정 PDA 생성
    const [multisigTradePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('multisig_trade'), initiator.toBuffer()],
      this.program.programId
    );

    try {
      const tx = await this.program.methods
        .createMultisigTrade(new BN(assetId), new BN(tradeAmount * 1e6))
        .accounts({
          multisigTrade: multisigTradePda,
          initiator: initiator,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      return { success: true, transactionHash: tx };
    } catch (error) {
      console.error('멀티시그 거래 생성 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 멀티시그 거래 승인
  async approveMultisigTrade(multisigTradeAddress: PublicKey) {
    const approver = this.provider.wallet.publicKey;

    try {
      const tx = await this.program.methods
        .approveMultisigTrade()
        .accounts({
          multisigTrade: multisigTradeAddress,
          approver: approver,
        })
        .rpc();

      return { success: true, transactionHash: tx };
    } catch (error) {
      console.error('멀티시그 거래 승인 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 보험 자산 정보 조회
  async getInsuranceAsset(insuranceAssetAddress: PublicKey) {
    try {
      const account = await this.program.account.insuranceAsset.fetch(insuranceAssetAddress);
      return {
        success: true,
        data: {
          owner: account.owner.toString(),
          insuranceCompany: account.insuranceCompany,
          productCategory: account.productCategory,
          productName: account.productName,
          contractDate: account.contractDate.toNumber(),
          contractPeriod: account.contractPeriod,
          paidPeriod: account.paidPeriod,
          annualPremium: account.annualPremium.toNumber() / 1e6,
          totalPaid: account.totalPaid.toNumber() / 1e6,
          isForSale: account.isForSale,
          registrationFee: account.registrationFee.toNumber() / 1e6,
          createdAt: account.createdAt.toNumber(),
        }
      };
    } catch (error) {
      console.error('보험 자산 조회 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 잔액 조회
  async getBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return balance / web3.LAMPORTS_PER_SOL;
  }

  // USDT 잔액 조회
  async getUsdtBalance(tokenAccount: PublicKey): Promise<number> {
    try {
      const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      return accountInfo.value.uiAmount || 0;
    } catch (error) {
      console.error('USDT 잔액 조회 실패:', error);
      return 0;
    }
  }
}

export default SolanaClient;
