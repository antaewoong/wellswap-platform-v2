import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import SolanaClient from '../lib/solana-client';

// 지갑 어댑터 CSS 임포트
require('@solana/wallet-adapter-react-ui/styles.css');

interface SolanaWalletConnectProps {
  onWalletConnected?: (client: SolanaClient) => void;
}

const SolanaWalletConnect: React.FC<SolanaWalletConnectProps> = ({ onWalletConnected }) => {
  const { publicKey, connected, disconnect } = useWallet();
  const [solanaClient, setSolanaClient] = useState<SolanaClient | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [usdtBalance, setUsdtBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // USDT Devnet Mint Address
  const USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');

  useEffect(() => {
    if (connected && publicKey) {
      initializeSolanaClient();
    } else {
      setSolanaClient(null);
      setBalance(0);
      setUsdtBalance(0);
    }
  }, [connected, publicKey]);

  const initializeSolanaClient = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      
      // Solana 클라이언트 초기화
      const client = new SolanaClient();
      
      // 지갑 연결 (Phantom 지갑 사용)
      const wallet = {
        publicKey: publicKey,
        signTransaction: async (transaction: any) => {
          // Phantom 지갑의 signTransaction 메서드 호출
          if (window.solana && window.solana.signTransaction) {
            return await window.solana.signTransaction(transaction);
          }
          throw new Error('지갑 서명 실패');
        },
        signAllTransactions: async (transactions: any[]) => {
          if (window.solana && window.solana.signAllTransactions) {
            return await window.solana.signAllTransactions(transactions);
          }
          throw new Error('지갑 서명 실패');
        }
      };

      await client.connectWallet(wallet);
      setSolanaClient(client);

      // 잔액 조회
      const solBalance = await client.getBalance(publicKey);
      setBalance(solBalance);

      // USDT 잔액 조회
      try {
        const usdtTokenAccount = await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          USDT_MINT,
          publicKey
        );
        
        const usdtBalance = await client.getUsdtBalance(usdtTokenAccount);
        setUsdtBalance(usdtBalance);
      } catch (error) {
        console.log('USDT 계정이 없습니다. 필요시 생성됩니다.');
        setUsdtBalance(0);
      }

      // 콜백 호출
      if (onWalletConnected) {
        onWalletConnected(client);
      }

    } catch (error) {
      console.error('솔라나 클라이언트 초기화 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUsdtAccount = async () => {
    if (!solanaClient || !publicKey) return;

    try {
      setLoading(true);
      await solanaClient.createTokenAccount(USDT_MINT, publicKey);
      
      // USDT 잔액 다시 조회
      const usdtTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        USDT_MINT,
        publicKey
      );
      
      const newUsdtBalance = await solanaClient.getUsdtBalance(usdtTokenAccount);
      setUsdtBalance(newUsdtBalance);
      
      alert('USDT 계정이 생성되었습니다!');
    } catch (error) {
      console.error('USDT 계정 생성 실패:', error);
      alert('USDT 계정 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getTestTokens = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      
      // Devnet에서 SOL 에어드롭
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const signature = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      
      // 잔액 다시 조회
      const newBalance = await solanaClient?.getBalance(publicKey) || 0;
      setBalance(newBalance);
      
      alert('테스트 SOL이 지급되었습니다!');
    } catch (error) {
      console.error('테스트 토큰 지급 실패:', error);
      alert('테스트 토큰 지급에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 지갑 연결 버튼 */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="font-light text-zinc-700">
            {connected ? 'Solana Wallet Connected' : 'Solana Wallet Not Connected'}
          </span>
        </div>
        <WalletMultiButton className="px-4 py-2 bg-zinc-900 text-zinc-50 font-light text-sm hover:bg-zinc-800 transition-colors" />
      </div>

      {/* 연결된 지갑 정보 */}
      {connected && publicKey && (
        <div className="space-y-4">
          {/* 지갑 주소 */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
            <h3 className="text-sm font-light text-zinc-600 mb-2">Wallet Address</h3>
            <p className="text-sm text-zinc-900 font-mono break-all">
              {publicKey.toString()}
            </p>
          </div>

          {/* 잔액 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
              <h3 className="text-sm font-light text-zinc-600 mb-2">SOL Balance</h3>
              <p className="text-lg font-light text-zinc-900">
                {loading ? 'Loading...' : `${balance.toFixed(4)} SOL`}
              </p>
            </div>
            
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
              <h3 className="text-sm font-light text-zinc-600 mb-2">USDT Balance</h3>
              <p className="text-lg font-light text-zinc-900">
                {loading ? 'Loading...' : `${usdtBalance.toFixed(2)} USDT`}
              </p>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={getTestTokens}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-light text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Get Test SOL
            </button>
            
            {usdtBalance === 0 && (
              <button
                onClick={createUsdtAccount}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white font-light text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Create USDT Account
              </button>
            )}
            
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-600 text-white font-light text-sm hover:bg-red-700 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>

          {/* 네트워크 정보 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-light text-blue-600 mb-2">Network Information</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p>• Network: Solana Devnet</p>
              <p>• RPC URL: https://api.devnet.solana.com</p>
              <p>• USDT Mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB</p>
            </div>
          </div>
        </div>
      )}

      {/* 연결 안됨 상태 */}
      {!connected && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <h3 className="text-sm font-light text-yellow-800 mb-2">Wallet Connection Required</h3>
          <p className="text-xs text-yellow-700">
            Please connect your Solana wallet (Phantom recommended) to use the platform.
          </p>
        </div>
      )}
    </div>
  );
};

export default SolanaWalletConnect;
