'use client';

import React, { useState } from 'react';
import MobileWalletConnect from './MobileWalletConnect';

export default function WellSwapTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState('');
  const [balance, setBalance] = useState(0);

  const handleConnect = (publicKey: string, walletBalance: number) => {
    setIsConnected(true);
    setConnectedAccount(publicKey);
    setBalance(walletBalance);
    console.log('지갑 연결 성공:', publicKey);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectedAccount('');
    setBalance(0);
    console.log('지갑 연결 해제');
  };

  const handleError = (error: string) => {
    console.error('지갑 연결 오류:', error);
    alert(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            WELLSWAP
          </h1>
          <p className="text-lg text-neutral-600">
            보험 자산 거래 플랫폼 - 테스트 버전
          </p>
        </header>

        {/* 연결 상태 */}
        <div className="max-w-md mx-auto mb-8">
          {isConnected ? (
            <div className="bg-green-100 border border-green-200 rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                ✅ 지갑 연결됨
              </h2>
              <p className="text-green-700 mb-2">
                주소: {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
              </p>
              <p className="text-green-700">
                잔액: {balance.toFixed(4)} MATIC
              </p>
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-200 rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                ⚠️ 지갑 미연결
              </h2>
              <p className="text-yellow-700">
                아래에서 지갑을 연결해주세요
              </p>
            </div>
          )}
        </div>

        {/* 테스트 기능들 */}
        <div className="max-w-md mx-auto space-y-4 mb-8">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
            onClick={() => alert('판매 기능 테스트')}
          >
            보험 자산 판매 (테스트)
          </button>
          
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
            onClick={() => alert('구매 기능 테스트')}
          >
            보험 자산 구매 (테스트)
          </button>

          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
            onClick={() => {
              console.log('현재 상태:', {
                isConnected,
                connectedAccount,
                balance,
                userAgent: navigator.userAgent,
                window: typeof window !== 'undefined'
              });
              alert('개발자 콘솔을 확인하세요');
            }}
          >
            상태 확인 (디버그)
          </button>
        </div>

        {/* 모바일 지갑 연결 */}
        <MobileWalletConnect
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onError={handleError}
          isConnected={isConnected}
          connectedAddress={connectedAccount}
        />

        {/* 푸터 */}
        <footer className="text-center mt-12 text-neutral-500">
          <p>WellSwap Test Version - 로컬 테스트용</p>
        </footer>
      </div>
    </div>
  );
}