'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, TrendingUp, Globe, Plus, Search } from 'lucide-react';

export default function WellSwapFinal() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState('');

  // 간단한 지갑 연결 시뮬레이션
  const handleConnectWallet = () => {
    setIsConnected(true);
    setConnectedAccount('0x1234...abcd');
    alert('지갑이 연결되었습니다! (시뮬레이션)');
  };

  const handleDisconnectWallet = () => {
    setIsConnected(false);
    setConnectedAccount('');
    alert('지갑 연결이 해제되었습니다!');
  };

  // 네비게이션
  const Navigation = () => (
    <nav className="flex justify-center space-x-1 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
      {['home', 'sell', 'buy', 'inquiry'].map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            currentPage === page
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-neutral-600 hover:bg-white/50 hover:text-neutral-800'
          }`}
        >
          {page === 'home' ? '홈' : 
           page === 'sell' ? '판매' : 
           page === 'buy' ? '구매' : '문의'}
        </button>
      ))}
    </nav>
  );

  // 홈 페이지
  const HomePage = () => (
    <div className="space-y-8">
      <div className="text-center">
        <motion.h1 
          className="text-5xl font-bold text-neutral-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          WELLSWAP
        </motion.h1>
        <motion.p 
          className="text-xl text-neutral-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          AI 기반 보험 자산 글로벌 거래 플랫폼
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          whileHover={{ scale: 1.02 }}
        >
          <Shield className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">블록체인 보안</h3>
          <p className="text-neutral-600">Polygon 네트워크 기반의 투명하고 안전한 거래</p>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          whileHover={{ scale: 1.02 }}
        >
          <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI 기반 평가</h3>
          <p className="text-neutral-600">머신러닝을 통한 정확한 보험 자산 가치 평가</p>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          whileHover={{ scale: 1.02 }}
        >
          <Globe className="w-12 h-12 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">글로벌 접근</h3>
          <p className="text-neutral-600">홍콩, 싱가포르, 한국 보험 시장 연결</p>
        </motion.div>
      </div>

      {/* 지갑 연결 섹션 */}
      <div className="text-center">
        {isConnected ? (
          <div className="bg-green-100 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ 지갑 연결됨</h3>
            <p className="text-green-700 mb-4">주소: {connectedAccount}</p>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPage('sell')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                보험 자산 판매하기
              </button>
              <button
                onClick={() => setCurrentPage('buy')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                보험 자산 구매하기
              </button>
              <button
                onClick={handleDisconnectWallet}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
              >
                지갑 연결 해제
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">🔐 지갑 연결</h3>
            <p className="text-blue-700 mb-4">거래를 시작하려면 지갑을 연결하세요</p>
            <button
              onClick={handleConnectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center mx-auto"
            >
              <Wallet className="w-5 h-5 mr-2" />
              MetaMask 연결하기
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // 판매 페이지
  const SellPage = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold mb-6 text-neutral-800">보험 자산 등록</h2>
        
        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 mb-4">지갑을 먼저 연결해주세요</p>
            <button
              onClick={handleConnectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              지갑 연결하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">상품명</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="보험 상품명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">보험회사</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="보험회사명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">카테고리</label>
              <select className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">카테고리 선택</option>
                <option value="life">생명보험</option>
                <option value="savings">저축보험</option>
                <option value="investment">투자보험</option>
                <option value="health">건강보험</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">연간 보험료 (USD)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">총 납입금액 (USD)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              onClick={() => alert('등록 완료! (시뮬레이션)')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              자산 등록하기
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // 구매 페이지
  const BuyPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">보험 자산 거래소</h2>
        <div className="flex items-center bg-white/50 rounded-xl px-4 py-2">
          <Search className="w-5 h-5 text-neutral-400 mr-2" />
          <input
            type="text"
            placeholder="검색..."
            className="bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* 샘플 리스팅 */}
      <div className="grid gap-6">
        {[
          {
            id: 1,
            company: 'AIA Group Limited',
            productName: 'AIA Savings Plan',
            category: 'Savings Plan',
            price: 15000,
            confidence: 95
          },
          {
            id: 2,
            company: 'Prudential Hong Kong',
            productName: 'PRU Life Protection',
            category: 'Life Insurance',
            price: 30000,
            confidence: 92
          }
        ].map((listing) => (
          <motion.div
            key={listing.id}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-neutral-800">{listing.productName}</h3>
                <p className="text-neutral-600">{listing.company}</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mt-2">
                  {listing.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">${listing.price.toLocaleString()}</p>
                <p className="text-sm text-neutral-500">거래 가격</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-neutral-500 mb-1">AI 신뢰도</p>
              <p className="font-medium">{listing.confidence}%</p>
            </div>

            <button
              onClick={() => isConnected ? 
                alert(`${listing.productName} 구매 완료! (시뮬레이션)`) : 
                handleConnectWallet()
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              <Wallet className="w-5 h-5 mr-2" />
              {isConnected ? '구매하기' : '지갑 연결 후 구매'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // 문의 페이지
  const InquiryPage = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold mb-6 text-neutral-800">고객 문의</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이름</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="성함을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">문의 내용</label>
            <textarea
              rows={5}
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="문의하실 내용을 입력하세요"
            />
          </div>

          <button
            onClick={() => alert('문의가 접수되었습니다!')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-medium transition-colors"
          >
            문의하기
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="text-2xl font-bold text-neutral-800">
            WELLSWAP
          </div>
          
          {/* 네비게이션 */}
          <Navigation />
          
          {/* 지갑 연결 상태 */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center bg-green-100 px-4 py-2 rounded-xl">
                <Wallet className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  {connectedAccount}
                </span>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">지갑 미연결</div>
            )}
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="mb-8">
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'sell' && <SellPage />}
          {currentPage === 'buy' && <BuyPage />}
          {currentPage === 'inquiry' && <InquiryPage />}
        </main>

        {/* 푸터 */}
        <footer className="text-center text-neutral-500">
          <p>© 2024 WellSwap. AI 기반 보험 자산 글로벌 거래 플랫폼</p>
        </footer>
      </div>
    </div>
  );
}