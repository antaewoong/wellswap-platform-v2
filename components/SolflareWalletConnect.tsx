'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

  // Solana 연결 설정
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );

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

  // 지갑 연결 상태 모니터링
  useEffect(() => {
    if (!wallet) return;

    const handleAccountChange = () => {
      if (wallet.isConnected && wallet.publicKey) {
        // 이미 연결된 상태에서는 connect() 호출하지 않고 바로 처리
        handleWalletConnected();
      } else {
        handleDisconnect();
      }
    };

    // 연결 상태 확인 - 이미 연결되어 있으면 바로 처리
    if (wallet.isConnected && wallet.publicKey) {
      handleWalletConnected();
    }

    // 이벤트 리스너 등록
    wallet.on?.('connect', handleAccountChange);
    wallet.on?.('disconnect', handleDisconnect);

    return () => {
      wallet.off?.('connect', handleAccountChange);
      wallet.off?.('disconnect', handleDisconnect);
    };
  }, [wallet]);

  // 지갑 연결 처리 (이미 연결된 상태에서 호출)
  const handleWalletConnected = useCallback(async () => {
    if (!wallet?.publicKey) return;

    setIsLoading(true);
    try {
      const publicKey = wallet.publicKey.toString();
      
      // SOL 잔액 조회 (에러 처리 개선)
      try {
        const solBalance = await connection.getBalance(wallet.publicKey);
        const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;
        setBalance(solBalanceFormatted);
        console.log('✅ SOL 잔액 조회 성공:', solBalanceFormatted);
      } catch (error) {
        console.error('❌ SOL 잔액 조회 실패:', error);
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
        console.log('✅ USDC 잔액 조회 성공:', usdcBalanceFormatted);
      } catch (error) {
        console.log('ℹ️ USDC 토큰 계정이 없습니다 - 필요시 자동 생성됩니다');
        setUsdtBalance(0);
      }

      onConnect(publicKey, solBalanceFormatted);
      console.log('✅ Solflare 지갑 연결 성공:', publicKey);
    } catch (error) {
      console.error('❌ 지갑 연결 처리 실패:', error);
      onError('지갑 연결 처리에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [wallet, connection, onConnect, onError]);

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

  return (
    <div className="flex flex-col space-y-6 p-6 bg-white rounded-xl shadow-lg border border-zinc-100">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-light text-zinc-900">
          Connect Solflare Wallet
        </h3>
        {isLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-zinc-300 border-t-zinc-600"></div>
        )}
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={!wallet || isLoading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white font-light py-3 px-6 rounded-lg transition-all duration-300"
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
