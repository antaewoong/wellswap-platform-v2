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
import { Program, AnchorProvider, web3, BN, Idl } from '@project-serum/anchor';
import { IDL, WellswapInsurance } from '../lib/wellswap-idl';

// 안전한 BN 생성 함수 - 강화된 타입 변환
function safeBN(value: any): BN {
  if (value === null || value === undefined) {
    console.log('⚠️ safeBN: null/undefined 값, 0으로 변환');
    return new BN('0');
  }
  
  // 강제 문자열 변환 및 검증
  let stringValue: string;
  
  if (typeof value === 'number') {
    // number를 직접 문자열로 변환
    stringValue = value.toString();
  } else if (typeof value === 'string') {
    stringValue = value;
  } else if (typeof value === 'bigint') {
    stringValue = value.toString();
  } else {
    // 기타 타입은 String()으로 변환
    stringValue = String(value);
  }
  
  // 빈 문자열이나 NaN 처리
  if (!stringValue || stringValue === 'NaN' || stringValue === 'undefined' || stringValue === 'null') {
    console.log(`⚠️ safeBN: 유효하지 않은 값 "${stringValue}", 0으로 변환`);
    return new BN('0');
  }
  
  console.log(`🔧 safeBN: ${typeof value} -> "${stringValue}"`);
  
  try {
    // 문자열을 확실히 전달
    return new BN(stringValue);
  } catch (error) {
    console.error('❌ safeBN 오류:', error, 'value:', value, 'stringValue:', stringValue);
    return new BN('0');
  }
}

// 환경 변수 검증 (실행 시점에 호출)
function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_SOLANA_RPC_URL',
    'NEXT_PUBLIC_SOLANA_PROGRAM_ID',
    'NEXT_PUBLIC_USDC_MINT_ADDRESS',
    'NEXT_PUBLIC_PLATFORM_WALLET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ 필수 환경 변수 누락:', missing);
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  console.log('✅ 모든 필수 환경 변수 확인됨');
}

// 솔라나 설정 (클라이언트용 상수)
const SOLANA_CONFIG = {
  RPC_URL: 'https://api.devnet.solana.com',
  PROGRAM_ID: '27btQLJWLR8qNF28Lbp9QHD6bfGZwFMt4L2Rkn7STnXf',
  USDC_MINT: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  PLATFORM_WALLET: 'HhYmywR1Nr9YWgT4NbBHsa6F8y2viYWhVbsy4s2J38kg',
  REGISTRATION_FEE_USDC: 300
};

// 솔라나 연결 설정
const connection = new Connection(SOLANA_CONFIG.RPC_URL, 'confirmed');

// WellSwap 프로그램 ID
const WELLSWAP_PROGRAM_ID = new PublicKey(SOLANA_CONFIG.PROGRAM_ID);

// USDC 토큰 주소 (Devnet)
const USDC_MINT = new PublicKey(SOLANA_CONFIG.USDC_MINT);

// 등록비 (USD 1:1 가치, 연산 제거)
const REGISTRATION_FEE_USDC = SOLANA_CONFIG.REGISTRATION_FEE_USDC;

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

// ★ 트랜잭션 준비 헬퍼 (현대화된 버전)
async function prepareTransaction(transaction: Transaction, publicKey: PublicKey) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = publicKey;
  
  // 트랜잭션 수수료 추정 및 검증
  try {
    const estimatedFee = await transaction.getEstimatedFee(connection);
    console.log('💰 예상 트랜잭션 수수료:', estimatedFee, 'lamports');
  } catch (error) {
    console.warn('⚠️ 수수료 추정 실패:', error);
  }
  
  return transaction;
}

// ★ 솔라나 컨트랙트 연결 헬퍼 (견고한 버전)
async function ensureSolanaConnection() {
  console.log('🔧 솔라나 설정 확인:', SOLANA_CONFIG);
  
  const solflare = (window as any).solflare;
  
  // 지갑 감지
  if (!solflare || (!solflare.isSolflare && !solflare.isPhantom)) {
    throw new Error('Solana 지갑(Solflare/Phantom)이 필요합니다.');
  }

  // 연결 시도 (타임아웃 포함)
  if (!solflare.isConnected) {
    console.log('🔄 지갑 연결 시도 중...');
    await Promise.race([
      solflare.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('지갑 연결 타임아웃')), 10000)
      )
    ]);
  }

  // 연결 검증
  if (!solflare.publicKey) {
    throw new Error('지갑 연결에 실패했습니다 - PublicKey가 없습니다.');
  }

  console.log('🔗 솔라나 지갑 연결됨:', solflare.publicKey.toString());
  
  // 네트워크 확인
  try {
    const balance = await connection.getBalance(solflare.publicKey);
    console.log('💰 지갑 잔액:', balance / 1e9, 'SOL');
  } catch (error) {
    console.warn('⚠️ 지갑 잔액 조회 실패:', error);
  }

  // Anchor Provider 생성 (지갑 메서드 바인딩)
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: solflare.publicKey,
      signTransaction: async (transaction: Transaction) => {
        return await solflare.signTransaction(transaction);
      },
      signAllTransactions: async (transactions: Transaction[]) => {
        return await solflare.signAllTransactions(transactions);
      },
    },
    { commitment: 'confirmed' }
  );

  // WellSwap 프로그램 인스턴스 생성
  const program = new Program<WellswapInsurance>(IDL as WellswapInsurance, WELLSWAP_PROGRAM_ID, provider);
  
  // 디버깅: program 객체 검증
  console.log('🔍 Program object created:', {
    programExists: !!program,
    methodsExist: !!program.methods,
    methodNames: program.methods ? Object.keys(program.methods) : 'No methods',
    registerMethod: !!program.methods?.registerInsuranceAsset,
    methodType: typeof program.methods?.registerInsuranceAsset
  });

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
    console.log('USDC 토큰 계정이 없습니다:', error);
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
    
    // 사용자 USDC 토큰 계정 확인/생성
    const usdcBalance = await getUsdcBalance(publicKey);
    console.log('💰 사용자 USDC 잔액:', usdcBalance);
    
    if (usdcBalance < registrationFeeUsd) {
      throw new Error(`등록비가 부족합니다. 필요: ${registrationFeeUsd} USDC, 보유: ${usdcBalance} USDC`);
    }
    
    // USDC 토큰 계정 자동 생성 (필요한 경우)
    const usdcAccountCreated = await createUsdcTokenAccount(publicKey);
    if (!usdcAccountCreated) {
      throw new Error('USDC 토큰 계정 생성에 실패했습니다.');
    }
    
    // USD → USDC 변환 (1:1 가치)
    const registrationFeeUsdc = usdToUsdc(registrationFeeUsd);
    const registrationFeeLamports = Math.floor(registrationFeeUsdc * Math.pow(10, 6)).toString(); // USDC 6자리 → 문자열

    // 사용자 USDC 토큰 계정
    const userTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
    
    // 플랫폼 USDC 토큰 계정 (관리자 계정)
    const platformPublicKey = new PublicKey(SOLANA_CONFIG.PLATFORM_WALLET);
    const platformTokenAccount = await getAssociatedTokenAddress(USDC_MINT, platformPublicKey);
    
    console.log('🏦 플랫폼 지갑:', platformPublicKey.toString());
    console.log('🏦 사용자 토큰 계정:', userTokenAccount.toString());
    console.log('🏦 플랫폼 토큰 계정:', platformTokenAccount.toString());

    // 보험 자산 PDA 생성
    const [insuranceAssetPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('insurance_asset'), publicKey.toBuffer()],
      WELLSWAP_PROGRAM_ID
    );

    console.log('📍 Insurance Asset PDA:', insuranceAssetPda.toString());
    console.log('📍 PDA Bump:', bump);

    // 계정이 이미 존재하는지 확인
    const accountInfo = await connection.getAccountInfo(insuranceAssetPda);
    if (accountInfo) {
      throw new Error('이미 등록된 보험 상품입니다.');
    }

    // 트랜잭션 생성
    const transaction = new Transaction();
    
    console.log('🔍 사용 가능한 프로그램 메서드:', Object.keys(program.methods));
    console.log('📊 전달할 데이터:', {
      assetData,
      registrationFeeLamports,
      registrationFeeUsd
    });
    
    console.log('🔍 BN 변환 전 타입 체크:', {
      contractDate: typeof assetData.contractDate,
      contractDateValue: assetData.contractDate,
      contractDateString: String(assetData.contractDate || 0),
      annualPremium: typeof assetData.annualPremium,
      annualPremiumValue: assetData.annualPremium,
      annualPremiumString: String(assetData.annualPremium || 0),
      totalPaid: typeof assetData.totalPaid,
      totalPaidValue: assetData.totalPaid,
      totalPaidString: String(assetData.totalPaid || 0),
      registrationFeeLamports: typeof registrationFeeLamports,
      registrationFeeLamportsValue: registrationFeeLamports
    });
    
    // 보험 자산 등록 인스트럭션 생성
    console.log('🔧 registerInsuranceAsset 메서드 호출');
    
    const registerInstruction = await program.methods
      .registerInsuranceAsset(
        {
          insuranceCompany: assetData.insuranceCompany,
          productCategory: assetData.productCategory,
          productName: assetData.productName,
          contractDate: safeBN(assetData.contractDate),
          contractPeriod: parseInt(assetData.contractPeriod || '10'),
          paidPeriod: parseInt(assetData.paidPeriod || '1'),
          annualPremium: safeBN(assetData.annualPremium),
          totalPaid: safeBN(assetData.totalPaid),
        },
        safeBN(registrationFeeLamports)
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
    
    console.log('🔄 보험 자산 등록 트랜잭션 서명 중...');
    const signedTransaction = await wallet.signTransaction(transaction);
    
    console.log('📡 트랜잭션 전송 중...');
    const txHash = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    });
    
    console.log('⏳ 트랜잭션 확인 중:', txHash);
    const confirmation = await connection.confirmTransaction(txHash, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('❌ 트랜잭션 실패:', confirmation.value.err);
      throw new Error(`트랜잭션 실패: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('✅ 보험 자산 등록 성공:', txHash);
    return { success: true, transactionHash: txHash };

  } catch (error: any) {
    console.error('❌ 보험 자산 등록 실패:', error);
    
    // SendTransactionError에서 로그 추출
    if (error.name === 'SendTransactionError' && error.logs) {
      console.error('📋 트랜잭션 로그:', error.logs);
    }
    
    let errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
    
    // Anchor 오류 파싱
    if (errorMessage.includes('DeclaredProgramIdMismatch')) {
      errorMessage = '프로그램 ID 불일치 오류입니다. 프로그램이 올바르게 배포되었는지 확인하세요.';
    } else if (errorMessage.includes('0x1004')) {
      errorMessage = '계정 임대 면제 오류입니다. 충분한 SOL이 있는지 확인하세요.';
    }
    
    return { success: false, error: errorMessage };
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
    
    // USD → USDC 변환 (1:1 가치)
    const tradeAmountUsdc = usdToUsdc(tradeAmountUsd);
    const tradeAmountLamports = Math.floor(tradeAmountUsdc * Math.pow(10, 6));

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
    
    // USD → USDC 변환 (1:1 가치)
    const salePriceUsdc = usdToUsdc(salePriceUsd);
    const salePriceLamports = Math.floor(salePriceUsdc * Math.pow(10, 6));

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
          const [solBal, usdcBal] = await Promise.all([
            getSolBalance(pubKey),
            getUsdcBalance(pubKey)
          ]);
          setBalance(solBal);
          setUsdtBalance(usdcBal); // 변수명은 그대로 유지 (UI 호환성)
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
