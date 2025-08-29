// components/SolanaContractIntegration.ts
// 🔗 WellSwap 솔라나 멀티시그 거래 시스템 완전 연동
// USD 1:1 가치 활용으로 불필요한 연산 제거

import { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { IDL } from '../lib/wellswap-idl';

// 솔라나 연결 설정
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// WellSwap 프로그램 ID
const WELLSWAP_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
);

// USDC 토큰 주소 (Devnet)
const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT_ADDRESS || 
  'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
);

// 등록비 (USD 1:1 가치, 연산 제거)
const REGISTRATION_FEE_USDC = Number(process.env.NEXT_PUBLIC_REGISTRATION_FEE_USDC || '300');

// Solflare 지갑 타입 정의
interface SolflareWallet {
  isSolflare?: boolean;
  publicKey?: PublicKey;
  isConnected?: boolean;
  connect?: () => Promise<void>;
  disconnect?: () => Promise<void>;
  signTransaction?: (transaction: any) => Promise<any>;
  signAllTransactions?: (transactions: any[]) => Promise<any[]>;
}

// ★ 트랜잭션 준비 헬퍼 (recentBlockhash 추가)
async function prepareTransaction(transaction: Transaction, publicKey: PublicKey) {
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;
  return transaction;
}

// ★ 솔라나 컨트랙트 연결 헬퍼 (기존 ensureWritableContract 대체)
async function ensureSolanaConnection() {
  const solflare = (window as any).solflare;
  if (!solflare?.isSolflare) {
    throw new Error('Solflare 지갑이 필요합니다.');
  }

  if (!solflare.isConnected) {
    await solflare.connect();
  }

  if (!solflare.publicKey) {
    throw new Error('지갑이 연결되지 않았습니다.');
  }

  // Anchor Provider 생성
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: solflare.publicKey,
      signTransaction: solflare.signTransaction,
      signAllTransactions: solflare.signAllTransactions,
    },
    { commitment: 'confirmed' }
  );

  // WellSwap 프로그램 인스턴스 생성
  const program = new Program(IDL, WELLSWAP_PROGRAM_ID, provider);

  return {
    connection,
    provider,
    program,
    wallet: solflare,
    publicKey: solflare.publicKey
  };
}

// 🏦 USDC 잔액 조회 (USD 1:1 가치)
export async function getUsdcBalance(publicKey: PublicKey): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
    const accountInfo = await getAccount(connection, tokenAccount);
    return Number(accountInfo.amount) / Math.pow(10, 6); // USDC는 6자리 소수점
  } catch (error) {
    console.log('USDC 토큰 계정이 없습니다 - 자동 생성 시도');
    return 0;
  }
}

// 🏦 USDC 토큰 계정 자동 생성
export async function createUsdcTokenAccount(publicKey: PublicKey): Promise<boolean> {
  try {
    const { wallet } = await ensureSolanaConnection();
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
    
    // 이미 존재하는지 확인
    try {
      await getAccount(connection, tokenAccount);
      console.log('✅ USDC 토큰 계정이 이미 존재합니다');
      return true;
    } catch {
      // 계정이 없으면 생성
      console.log('🔄 USDC 토큰 계정 생성 중...');
      
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          tokenAccount,
          publicKey,
          USDC_MINT
        )
      );

      // 트랜잭션 준비
      await prepareTransaction(transaction, publicKey);
      
      // 지갑으로 서명
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // 트랜잭션 전송
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);
      
      console.log('✅ USDC 토큰 계정 생성 완료:', signature);
      return true;
    }
  } catch (error) {
    console.error('❌ USDC 토큰 계정 생성 실패:', error);
    return false;
  }
}

// 🏦 SOL 잔액 조회
export async function getSolBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / web3.LAMPORTS_PER_SOL;
}

// 💰 USD → USDC 변환 (1:1 가치, 연산 제거)
export function usdToUsdc(usdAmount: number): number {
  // USD 1:1 가치이므로 단순 반환 (연산 제거)
  return usdAmount;
}

// 🏦 보험 자산 등록 (USDC 결제)
export async function registerInsuranceAsset(
  assetData: any,
  registrationFeeUsd: number = REGISTRATION_FEE_USDC
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const { program, wallet, publicKey } = await ensureSolanaConnection();
    
    // USDC 토큰 계정 자동 생성
    const usdcAccountCreated = await createUsdcTokenAccount(publicKey);
    if (!usdcAccountCreated) {
      throw new Error('USDC 토큰 계정 생성에 실패했습니다.');
    }
    
    // USD → USDC 변환 (1:1 가치)
    const registrationFeeUsdc = usdToUsdc(registrationFeeUsd);
    const registrationFeeLamports = Math.floor(registrationFeeUsdc * Math.pow(10, 6)); // USDC 6자리

    // 사용자 USDC 토큰 계정
    const userTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
    
    // 플랫폼 USDC 토큰 계정 (관리자 계정)
    const platformPublicKey = new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET || publicKey.toString());
    const platformTokenAccount = await getAssociatedTokenAddress(USDC_MINT, platformPublicKey);

    // 보험 자산 PDA 생성
    const [insuranceAssetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('insurance_asset'), publicKey.toBuffer()],
      WELLSWAP_PROGRAM_ID
    );

    // 트랜잭션 생성
    const transaction = new Transaction();
    
    // 보험 자산 등록 인스트럭션 생성
    const registerInstruction = await program.methods
      .registerInsuranceAsset(
        {
          insuranceCompany: assetData.insuranceCompany,
          productCategory: assetData.productCategory,
          productName: assetData.productName,
          contractDate: new BN(assetData.contractDate),
          contractPeriod: assetData.contractPeriod,
          paidPeriod: assetData.paidPeriod,
          annualPremium: new BN(assetData.annualPremium),
          totalPaid: new BN(assetData.totalPaid),
        },
        new BN(registrationFeeLamports)
      )
      .accounts({
        insuranceAsset: insuranceAssetPda,
        user: publicKey,
        userTokenAccount,
        platformTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    
    // 트랜잭션에 인스트럭션 추가
    transaction.add(registerInstruction);

    // 트랜잭션 준비 및 서명
    await prepareTransaction(transaction, publicKey);
    const signature = await wallet.signTransaction(transaction);
    const txHash = await connection.sendRawTransaction(signature.serialize());
    await connection.confirmTransaction(txHash);

    console.log('✅ 보험 자산 등록 성공:', txHash);
    return { success: true, transactionHash: txHash };

  } catch (error) {
    console.error('❌ 보험 자산 등록 실패:', error);
    return { success: false, error: error.message };
  }
}

// 🏦 보험 자산 구매 (USDC 결제)
export async function purchaseInsuranceAsset(
  assetPda: PublicKey,
  purchasePriceUsd: number
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const { program, wallet, publicKey } = await ensureSolanaConnection();
    
    // USD → USDC 변환 (1:1 가치)
    const purchasePriceUsdc = usdToUsdc(purchasePriceUsd);
    const purchasePriceLamports = Math.floor(purchasePriceUsdc * Math.pow(10, 6));

    // 구매자 USDC 토큰 계정
    const buyerTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
    
    // 판매자 USDC 토큰 계정 (자산 소유자)
    const sellerPublicKey = new PublicKey(process.env.NEXT_PUBLIC_SELLER_WALLET || publicKey.toString());
    const sellerTokenAccount = await getAssociatedTokenAddress(USDC_MINT, sellerPublicKey);

    // 트랜잭션 생성
    const transaction = new Transaction();
    
    // 보험 자산 구매 인스트럭션 생성
    const purchaseInstruction = await program.methods
      .purchaseInsuranceAsset(new BN(purchasePriceLamports))
      .accounts({
        insuranceAsset: assetPda,
        buyer: publicKey,
        buyerTokenAccount,
        sellerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
    
    // 트랜잭션에 인스트럭션 추가
    transaction.add(purchaseInstruction);

    // 트랜잭션 준비 및 서명
    await prepareTransaction(transaction, publicKey);
    const signature = await wallet.signTransaction(transaction);
    const txHash = await connection.sendRawTransaction(signature.serialize());
    await connection.confirmTransaction(txHash);

    console.log('✅ 보험 자산 구매 성공:', txHash);
    return { success: true, transactionHash: txHash };

  } catch (error) {
    console.error('❌ 보험 자산 구매 실패:', error);
    return { success: false, error: error.message };
  }
}

// 🏦 멀티시그 거래 생성
export async function createMultisigTrade(
  assetId: number,
  tradeAmountUsd: number
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const { program, wallet, publicKey } = await ensureSolanaConnection();
    
    // USD → USDT 변환 (1:1 가치)
    const tradeAmountUsdt = usdToUsdt(tradeAmountUsd);
    const tradeAmountLamports = Math.floor(tradeAmountUsdt * Math.pow(10, 6));

    // 멀티시그 거래 PDA 생성
    const [multisigTradePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('multisig_trade'), publicKey.toBuffer()],
      WELLSWAP_PROGRAM_ID
    );

    // 트랜잭션 생성
    const transaction = new Transaction();
    
    const createTradeInstruction = await program.methods
      .createMultisigTrade(
        new BN(assetId),
        new BN(tradeAmountLamports)
      )
      .accounts({
        multisigTrade: multisigTradePda,
        initiator: publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    
    transaction.add(createTradeInstruction);

    // 트랜잭션 준비 및 서명
    await prepareTransaction(transaction, publicKey);
    const signature = await wallet.signTransaction(transaction);
    const txHash = await connection.sendRawTransaction(signature.serialize());
    await connection.confirmTransaction(txHash);

    console.log('✅ 멀티시그 거래 생성 성공:', txHash);
    return { success: true, transactionHash: txHash };

  } catch (error) {
    console.error('❌ 멀티시그 거래 생성 실패:', error);
    return { success: false, error: error.message };
  }
}

// 🏦 멀티시그 거래 승인
export async function approveMultisigTrade(
  tradePda: PublicKey
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const { program, wallet, publicKey } = await ensureSolanaConnection();

    // 트랜잭션 생성
    const transaction = new Transaction();
    
    const approveInstruction = await program.methods
      .approveMultisigTrade()
      .accounts({
        multisigTrade: tradePda,
        approver: publicKey,
      })
      .instruction();
    
    transaction.add(approveInstruction);

    // 트랜잭션 준비 및 서명
    await prepareTransaction(transaction, publicKey);
    const signature = await wallet.signTransaction(transaction);
    const txHash = await connection.sendRawTransaction(signature.serialize());
    await connection.confirmTransaction(txHash);

    console.log('✅ 멀티시그 거래 승인 성공:', txHash);
    return { success: true, transactionHash: txHash };

  } catch (error) {
    console.error('❌ 멀티시그 거래 승인 실패:', error);
    return { success: false, error: error.message };
  }
}

// 🏦 관리자 인증 (지갑 주소 기반)
export function isAdminWallet(walletAddress: string): boolean {
  const adminAddresses = [
    process.env.NEXT_PUBLIC_ADMIN_WALLET_1,
    process.env.NEXT_PUBLIC_ADMIN_WALLET_2,
    process.env.NEXT_PUBLIC_ADMIN_WALLET_3,
  ].filter(Boolean);
  
  return adminAddresses.includes(walletAddress);
}

// 🏦 보험 자산 판매 등록
export async function listInsuranceAssetForSale(
  assetPda: PublicKey,
  salePriceUsd: number
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const { program, wallet, publicKey } = await ensureSolanaConnection();
    
    // USD → USDT 변환 (1:1 가치)
    const salePriceUsdt = usdToUsdt(salePriceUsd);
    const salePriceLamports = Math.floor(salePriceUsdt * Math.pow(10, 6));

    // 트랜잭션 생성
    const transaction = new Transaction().add(
      await program.methods
        .listInsuranceAssetForSale(new BN(salePriceLamports))
        .accounts({
          insuranceAsset: assetPda,
          owner: publicKey,
        })
        .instruction()
    );

    // 트랜잭션 서명 및 전송
    const signature = await wallet.signTransaction(transaction);
    const txHash = await connection.sendRawTransaction(signature.serialize());
    await connection.confirmTransaction(txHash);

    console.log('✅ 보험 자산 판매 등록 성공:', txHash);
    return { success: true, transactionHash: txHash };

  } catch (error) {
    console.error('❌ 보험 자산 판매 등록 실패:', error);
    return { success: false, error: error.message };
  }
}

// 🏦 보험 자산 판매 취소
export async function cancelInsuranceAssetSale(
  assetPda: PublicKey
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const { program, wallet, publicKey } = await ensureSolanaConnection();

    // 트랜잭션 생성
    const transaction = new Transaction().add(
      await program.methods
        .cancelInsuranceAssetSale()
        .accounts({
          insuranceAsset: assetPda,
          owner: publicKey,
        })
        .instruction()
    );

    // 트랜잭션 서명 및 전송
    const signature = await wallet.signTransaction(transaction);
    const txHash = await connection.sendRawTransaction(signature.serialize());
    await connection.confirmTransaction(txHash);

    console.log('✅ 보험 자산 판매 취소 성공:', txHash);
    return { success: true, transactionHash: txHash };

  } catch (error) {
    console.error('❌ 보험 자산 판매 취소 실패:', error);
    return { success: false, error: error.message };
  }
}

// 🏦 React Hooks
export function useSolanaWallet() {
  const [wallet, setWallet] = useState<SolflareWallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);

  useEffect(() => {
    const detectWallet = () => {
      const solflare = (window as any).solflare;
      if (solflare?.isSolflare) {
        setWallet(solflare);
        setIsConnected(solflare.isConnected);
        setPublicKey(solflare.publicKey?.toString() || null);
      }
    };

    detectWallet();
    window.addEventListener('load', detectWallet);
    return () => window.removeEventListener('load', detectWallet);
  }, []);

  useEffect(() => {
    if (publicKey) {
      const fetchBalances = async () => {
        try {
          const pubKey = new PublicKey(publicKey);
          const [solBal, usdtBal] = await Promise.all([
            getSolBalance(pubKey),
            getUsdtBalance(pubKey)
          ]);
          setBalance(solBal);
          setUsdtBalance(usdtBal);
        } catch (error) {
          console.error('잔액 조회 실패:', error);
        }
      };

      fetchBalances();
      const interval = setInterval(fetchBalances, 10000); // 10초마다 갱신
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  return {
    wallet,
    isConnected,
    publicKey,
    balance,
    usdtBalance,
    isAdmin: publicKey ? isAdminWallet(publicKey) : false
  };
}

export function useSolanaAssetRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerAsset = async (assetData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await registerInsuranceAsset(assetData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { registerAsset, isLoading, error };
}

export function useSolanaTrading() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchaseAsset = async (assetPda: PublicKey, priceUsd: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await purchaseInsuranceAsset(assetPda, priceUsd);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createTrade = async (assetId: number, amountUsd: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createMultisigTrade(assetId, amountUsd);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveTrade = async (tradePda: PublicKey) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await approveMultisigTrade(tradePda);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    purchaseAsset, 
    createTrade, 
    approveTrade, 
    isLoading, 
    error 
  };
}
