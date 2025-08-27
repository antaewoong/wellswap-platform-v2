'use client';
import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Menu, X, Wallet, Globe } from 'lucide-react';

// 직접 import로 변경하여 안정성 확보
import SellPage from './pages/SellPage';
import BuyPage from './pages/BuyPage';
import ConciergePage from './pages/ConciergePage';
import HomePage from './pages/HomePage';

export default function WellSwapMain() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [web3Account, setWeb3Account] = useState<string | null>(null);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  }, []);

  // 지갑 연결 핸들러
  const handleWalletConnect = useCallback(async () => {
    try {
      // MetaMask 연결 로직
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts'
        });
        if (accounts.length > 0) {
          setWeb3Account(accounts[0]);
          setIsWalletConnected(true);
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  }, []);

  // AI 평가 완료 핸들러
  const handleValuationComplete = useCallback((result: any) => {
    console.log('AI Valuation completed:', result);
    // 결과 처리 로직
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 네비게이션 */}
      <nav className="flex items-center justify-between p-6 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <button className="text-2xl font-extralight tracking-wider text-zinc-900">
            WELLSWAP
          </button>
          <div className="hidden md:flex space-x-6">
            <button 
              onClick={() => handlePageChange('sell')}
              className={`font-light transition-colors ${currentPage === 'sell' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Sell Insurance
            </button>
            <button 
              onClick={() => handlePageChange('buy')}
              className={`font-light transition-colors ${currentPage === 'buy' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Buy Insurance
            </button>
            <button 
              onClick={() => handlePageChange('concierge')}
              className={`font-light transition-colors ${currentPage === 'concierge' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Concierge
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-light hover:bg-zinc-50 transition-colors">
            <Globe className="w-4 h-4" />
            <span>🇺🇸 English</span>
          </button>
          
          {isWalletConnected ? (
            <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 text-zinc-50 rounded-lg text-sm font-light hover:bg-zinc-800 transition-colors">
              <Wallet className="w-4 h-4" />
              <span>{web3Account?.slice(0, 6)}...{web3Account?.slice(-4)}</span>
            </button>
          ) : (
            <button 
              onClick={handleWalletConnect}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 text-zinc-50 rounded-lg text-sm font-light hover:bg-zinc-800 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 p-4 space-y-2">
          <button 
            onClick={() => handlePageChange('sell')}
            className="block w-full text-left py-2 font-light text-zinc-600 hover:text-zinc-900"
          >
            Sell Insurance
          </button>
          <button 
            onClick={() => handlePageChange('buy')}
            className="block w-full text-left py-2 font-light text-zinc-600 hover:text-zinc-900"
          >
            Buy Insurance
          </button>
          <button 
            onClick={() => handlePageChange('concierge')}
            className="block w-full text-left py-2 font-light text-zinc-600 hover:text-zinc-900"
          >
            Concierge
          </button>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {currentPage === 'home' && (
          <HomePage 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
        
        {currentPage === 'sell' && (
          <SellPage 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onValuationComplete={handleValuationComplete}
          />
        )}
        
        {currentPage === 'buy' && (
          <BuyPage 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
        
        {currentPage === 'concierge' && (
          <ConciergePage 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}
