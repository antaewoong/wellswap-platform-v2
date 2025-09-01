'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

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

interface SolflareWalletConnectProps {
  onConnect: (publicKey: string, balance: number) => void;
  onDisconnect: () => void;
  onError: (error: string) => void;
  isConnected: boolean;
  connectedAddress?: string;
}

const SolflareWalletConnect: React.FC<SolflareWalletConnectProps> = ({
  onConnect,
  onDisconnect,
  onError,
  isConnected,
  connectedAddress
}) => {
  const [wallet, setWallet] = useState<SolflareWallet | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [usdtBalance, setUsdtBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 중복 호출 가드 + 스로틀
  const lastCheckedPubkeyRef = useRef<string | null>(null);
  const balanceFetchLockRef = useRef(false);

  // Solana 연결 설정 - useMemo로 고정
  const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = useMemo(() => {
    console.log('🔗 Solana RPC 연결 설정:', RPC_URL);
    return new Connection(RPC_URL, 'confirmed');
  }, [RPC_URL]);

  // USDC 토큰 주소 (Devnet)
  const USDC_MINT = new PublicKey(
    process.env.NEXT_PUBLIC_USDC_MINT_ADDRESS || 
    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' // Devnet USDC
  );

  // Solflare 지갑 감지
  useEffect(() => {
    const detectWallet = () => {
      const solflare = (window as any).solflare;
      if (solflare?.isSolflare) {
        setWallet(solflare);
        console.log('🔗 Solflare 지갑 감지됨');
      } else {
        console.log('⚠️ Solflare 지갑이 설치되지 않았습니다');
        setWallet(null);
      }
    };

    // 즉시 감지
    detectWallet();
    
    // 페이지 로드 후 다시 감지
    if (document.readyState === 'loading') {
      window.addEventListener('load', detectWallet);
    }
    
    // 지갑 설치 후 감지를 위한 이벤트 리스너
    window.addEventListener('solflare#initialized', detectWallet);
    
    return () => {
      window.removeEventListener('load', detectWallet);
      window.removeEventListener('solflare#initialized', detectWallet);
    };
  }, []);

  // 지갑 연결 해제
  const handleDisconnect = useCallback(async () => {
    try {
      await wallet?.disconnect?.();
      setBalance(0);
      setUsdtBalance(0);
      onDisconnect();
      console.log('🔌 Solflare 지갑 연결 해제');
    } catch (error) {
      console.error('❌ 지갑 연결 해제 실패:', error);
      onError('지갑 연결 해제에 실패했습니다');
    }
  }, [wallet, onDisconnect, onError]);

  // 지갑 연결 처리 (중복 호출 가드 + 스로틀 적용)
  const handleWalletConnected = useCallback(async () => {
    if (!wallet?.publicKey) return;
    
    const pk = wallet.publicKey.toBase58();
    if (!pk) return;

    // 동일 주소 중복 방지 (더 엄격하게)
    if (lastCheckedPubkeyRef.current === pk) {
      if (process.env.NODE_ENV === 'development') console.log('[wallet] skip duplicate balance fetch for:', pk);
      return;
    }
    
    // 스로틀링 강화
    if (balanceFetchLockRef.current) {
      if (process.env.NODE_ENV === 'development') console.log('[wallet] balance fetch locked, skipping');
      return;
    }
    
    balanceFetchLockRef.current = true;
    lastCheckedPubkeyRef.current = pk;

    setIsLoading(true);
    try {
      const publicKey = wallet.publicKey.toString();
      let solBalanceFormatted = 0;
      
      // SOL 잔액 조회 (에러 처리 개선)
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 SOL 잔액 조회 시작:', publicKey);
        }
        const solBalance = await connection.getBalance(wallet.publicKey);
        solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;
        setBalance(solBalanceFormatted);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ SOL 잔액 조회 성공:', solBalanceFormatted);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ SOL 잔액 조회 실패:', error);
        }
        setBalance(0);
      }

      // USDC 잔액 조회 (에러 처리 개선)
      try {
        const usdcTokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          wallet.publicKey
        );
        const usdcAccountInfo = await connection.getTokenAccountBalance(usdcTokenAccount);
        const usdcBalanceFormatted = usdcAccountInfo.value.uiAmount || 0;
        setUsdtBalance(usdcBalanceFormatted);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ USDC 잔액 조회 성공:', usdcBalanceFormatted);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ USDC 토큰 계정이 없습니다 - 필요시 자동 생성됩니다');
        }
        setUsdtBalance(0);
      }

      onConnect(publicKey, solBalanceFormatted);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Solflare 지갑 연결 성공:', publicKey);
      }
    } catch (error) {
      console.error('❌ 지갑 연결 처리 실패:', error);
      onError('지갑 연결 처리에 실패했습니다');
    } finally {
      setIsLoading(false);
      // 스로틀링 시간을 더 길게 설정
      setTimeout(() => {
        balanceFetchLockRef.current = false;
        if (process.env.NODE_ENV === 'development') {
          console.log('[wallet] balance fetch lock released');
        }
      }, 3000); // 3초로 증가
    }
  }, [wallet, connection, onConnect, onError]);

  // 지갑 연결 상태 모니터링 - 이벤트 기반으로만 처리
  useEffect(() => {
    if (!wallet) return;

    const onConnect = () => {
      console.log('🔗 Solflare 지갑 연결 이벤트 발생');
      handleWalletConnected();
    };
    const onDisconnect = () => {
      console.log('🔌 Solflare 지갑 연결 해제 이벤트 발생');
      handleDisconnect();
    };

    // 이벤트 리스너 등록 (타입 안전하게)
    try {
      const walletAny = wallet as any;
      if (typeof walletAny.on === 'function') {
        walletAny.on('connect', onConnect);
        walletAny.on('disconnect', onDisconnect);
      }
    } catch (error) {
      console.warn('지갑 이벤트 리스너 등록 실패:', error);
    }

    // 이미 연결되어 있으면 초기화 (한 번만)
    if (wallet.isConnected && wallet.publicKey && !lastCheckedPubkeyRef.current) {
      console.log('🔗 이미 연결된 지갑 감지 - 초기화');
      handleWalletConnected();
    }

    return () => {
      try {
        const walletAny = wallet as any;
        if (typeof walletAny.off === 'function') {
          walletAny.off('connect', onConnect);
          walletAny.off('disconnect', onDisconnect);
        }
      } catch (error) {
        console.warn('지갑 이벤트 리스너 해제 실패:', error);
      }
    };
  }, [wallet]); // 의존성 배열에서 handleWalletConnected, handleDisconnect 제거

  // 지갑 연결 (새로 연결할 때만 호출)
  const handleConnect = useCallback(async () => {
    if (!wallet) {
      onError('Solflare 지갑을 설치해주세요');
      return;
    }

    // 이미 연결되어 있으면 바로 처리
    if (wallet.isConnected && wallet.publicKey) {
      handleWalletConnected();
      return;
    }

    setIsLoading(true);
    try {
      await wallet.connect?.();
      
      if (wallet.publicKey) {
        handleWalletConnected();
      } else {
        throw new Error('지갑 연결 후 publicKey를 가져올 수 없습니다');
      }
    } catch (error) {
      console.error('❌ 지갑 연결 실패:', error);
      // 에러 메시지를 더 구체적으로 제공
      const errorMessage = error instanceof Error ? error.message : '지갑 연결에 실패했습니다';
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, handleWalletConnected, onError]);

  // 테스트 SOL 받기 (Devnet)
  const requestAirdrop = async () => {
    if (!wallet?.publicKey) return;
    
    setIsLoading(true);
    try {
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        2 * LAMPORTS_PER_SOL // 2 SOL
      );
      await connection.confirmTransaction(signature);
      
      // 잔액 새로고침
      const newBalance = await connection.getBalance(wallet.publicKey);
      setBalance(newBalance / LAMPORTS_PER_SOL);
      
      console.log('💰 테스트 SOL 받기 성공');
    } catch (error) {
      console.error('❌ 테스트 SOL 받기 실패:', error);
      onError('테스트 SOL 받기에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // USDC 토큰 계정 생성
  const createUsdcAccount = async () => {
    if (!wallet?.publicKey) return;
    
    setIsLoading(true);
    try {
      const usdcTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        wallet.publicKey
      );
      
      // 토큰 계정이 이미 존재하는지 확인
      const accountInfo = await connection.getAccountInfo(usdcTokenAccount);
      if (accountInfo) {
        console.log('USDC 토큰 계정이 이미 존재합니다');
        return;
      }

      // 토큰 계정 생성 트랜잭션
      const transaction = new (await import('@solana/web3.js')).Transaction().add(
        (await import('@solana/spl-token')).createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          usdcTokenAccount,
          wallet.publicKey,
          USDC_MINT
        )
      );

      const signature = await wallet.signTransaction?.(transaction);
      if (signature) {
        await connection.sendRawTransaction(signature.serialize());
        console.log('✅ USDC 토큰 계정 생성 성공');
      }
    } catch (error) {
      console.error('❌ USDC 토큰 계정 생성 실패:', error);
      onError('USDC 토큰 계정 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`flex flex-col space-y-6 p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 ${isMobile ? 'mobile-glass-shadow' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg md:text-xl font-light text-neutral-900">
          Connect Solflare Wallet
        </h3>
        {isLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-300 border-t-neutral-600"></div>
        )}
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={!wallet || isLoading}
            className={`
              w-full bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 
              disabled:bg-neutral-300 text-white font-light py-4 px-6 rounded-xl transition-all duration-300
              min-h-[48px] active:scale-95 shadow-lg hover:shadow-xl
              ${isMobile ? 'text-base' : 'text-sm'}
            `}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {!wallet ? 'Install Solflare' : isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {!wallet && (
            <div className="text-sm text-zinc-500 text-center">
              <a 
                href="https://solflare.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Download Solflare Wallet →
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Connected Address</div>
            <div className="font-mono text-sm text-zinc-800 break-all">
              {connectedAddress}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">SOL Balance</div>
              <div className="font-light text-lg text-zinc-900">
                {balance.toFixed(4)} SOL
              </div>
            </div>
            
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">USDC Balance</div>
              <div className="font-light text-lg text-zinc-900">
                {usdtBalance.toFixed(2)} USDC
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={requestAirdrop}
              disabled={isLoading}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-light py-2 px-4 rounded-lg transition-all duration-300"
            >
              Get Test SOL
            </button>
            
            <button
              onClick={createUsdcAccount}
              disabled={isLoading}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-sm font-light py-2 px-4 rounded-lg transition-all duration-300"
            >
              Create USDC Account
            </button>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="w-full bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 text-zinc-700 font-light py-3 px-6 rounded-lg transition-all duration-300 border border-zinc-300"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default SolflareWalletConnect;
