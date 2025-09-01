'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, TrendingUp, Globe, Plus, Search } from 'lucide-react';
import MobileWalletConnect from './MobileWalletConnect';

interface ListingData {
  id: number;
  company: string;
  productName: string;
  category: string;
  surrenderValue: number;
  transferValue: number;
  platformPrice: number;
  confidence: number;
  riskGrade: string;
  contractPeriod: string;
  paidPeriod: string;
  annualPayment: number;
  status: 'available' | 'pending' | 'sold';
  seller: string;
  listingDate: string;
}

export default function WellSwapWorking() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState('');
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 실제 보험 리스팅 데이터 (기존과 동일)
  const [listingData] = useState<ListingData[]>([
    {
      id: 1,
      company: 'AIA Group Limited',
      productName: 'AIA Savings Plan',
      category: 'Savings Plan',
      surrenderValue: 12000,
      transferValue: 11500,
      platformPrice: 15000,
      confidence: 0.95,
      riskGrade: 'A',
      contractPeriod: '10 Years',
      paidPeriod: '5 Years',
      annualPayment: 3000,
      status: 'available' as const,
      seller: '0x1234...5678',
      listingDate: '2024-08-20'
    },
    {
      id: 2,
      company: 'Prudential Hong Kong',
      productName: 'PRU Life Protection',
      category: 'Life Insurance',
      surrenderValue: 25000,
      transferValue: 24000,
      platformPrice: 30000,
      confidence: 0.92,
      riskGrade: 'A',
      contractPeriod: '20 Years',
      paidPeriod: '15 Years',
      annualPayment: 5000,
      status: 'available' as const,
      seller: '0x9999...8888',
      listingDate: '2024-08-22'
    }
  ]);

  // 판매 데이터 상태
  const [sellData, setSellData] = useState({
    productName: '',
    insuranceCompany: '',
    category: '',
    annualPayment: '',
    totalPayment: '',
    contractDate: '',
    contractPeriod: '',
    paidPeriod: ''
  });

  // 지갑 연결 처리
  const handleConnect = (publicKey: string, walletBalance: number) => {
    setIsConnected(true);
    setConnectedAccount(publicKey);
    setBalance(walletBalance);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectedAccount('');
    setBalance(0);
  };

  const handleError = (error: string) => {
    console.error('지갑 연결 오류:', error);
    alert(error);
  };

  // 판매 처리 (실제 API 연동 준비)
  const handleSellSubmit = async () => {
    if (!isConnected) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 여기에 실제 InsuranceAPI.registerInsuranceAsset 호출
      console.log('보험 자산 등록:', sellData);
      
      // 임시 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`🎉 등록 완료!\n상품명: ${sellData.productName}\n보험회사: ${sellData.insuranceCompany}`);
      
      // 폼 리셋
      setSellData({
        productName: '',
        insuranceCompany: '',
        category: '',
        annualPayment: '',
        totalPayment: '',
        contractDate: '',
        contractPeriod: '',
        paidPeriod: ''
      });
    } catch (error: any) {
      alert(`등록 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 구매 처리 (실제 API 연동 준비)
  const handleBuySubmit = async (listing: ListingData) => {
    if (!isConnected) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 여기에 실제 InsuranceAPI.purchaseInsuranceAsset 호출
      console.log('보험 자산 구매:', listing);
      
      // 임시 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`🎉 구매 완료!\n상품: ${listing.productName}\n회사: ${listing.company}\n가격: $${listing.platformPrice.toLocaleString()}`);
    } catch (error: any) {
      alert(`구매 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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

      <div className="text-center">
        <p className="text-neutral-500 mb-4">시작하려면 지갑을 연결하세요</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCurrentPage('sell')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            보험 자산 판매하기
          </button>
          <button
            onClick={() => setCurrentPage('buy')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            보험 자산 구매하기
          </button>
        </div>
      </div>
    </div>
  );

  // 판매 페이지 (원본과 동일한 디자인)
  const SellPage = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold mb-6 text-neutral-800">보험 자산 등록</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">상품명</label>
            <input
              type="text"
              value={sellData.productName}
              onChange={(e) => setSellData({...sellData, productName: e.target.value})}
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="보험 상품명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">보험회사</label>
            <input
              type="text"
              value={sellData.insuranceCompany}
              onChange={(e) => setSellData({...sellData, insuranceCompany: e.target.value})}
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="보험회사명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">카테고리</label>
            <select
              value={sellData.category}
              onChange={(e) => setSellData({...sellData, category: e.target.value})}
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">카테고리 선택</option>
              <option value="Life Insurance">생명보험</option>
              <option value="Savings Plan">저축보험</option>
              <option value="Investment">투자보험</option>
              <option value="Health Insurance">건강보험</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">연간 보험료 (USD)</label>
              <input
                type="number"
                value={sellData.annualPayment}
                onChange={(e) => setSellData({...sellData, annualPayment: e.target.value})}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">총 납입금액 (USD)</label>
              <input
                type="number"
                value={sellData.totalPayment}
                onChange={(e) => setSellData({...sellData, totalPayment: e.target.value})}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">계약일</label>
              <input
                type="date"
                value={sellData.contractDate}
                onChange={(e) => setSellData({...sellData, contractDate: e.target.value})}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">계약기간</label>
              <input
                type="text"
                value={sellData.contractPeriod}
                onChange={(e) => setSellData({...sellData, contractPeriod: e.target.value})}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 10년"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">납입기간</label>
              <input
                type="text"
                value={sellData.paidPeriod}
                onChange={(e) => setSellData({...sellData, paidPeriod: e.target.value})}
                className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 5년"
              />
            </div>
          </div>

          <button
            onClick={handleSellSubmit}
            disabled={isLoading || !isConnected}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                자산 등록 {!isConnected && '(지갑 연결 필요)'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // 구매 페이지 (원본과 동일한 디자인)
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

      <div className="grid gap-6">
        {listingData.map((listing) => (
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
                <p className="text-2xl font-bold text-green-600">${listing.platformPrice.toLocaleString()}</p>
                <p className="text-sm text-neutral-500">거래 가격</p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-neutral-500">해지환급금</p>
                <p className="font-medium">${listing.surrenderValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">AI 신뢰도</p>
                <p className="font-medium">{(listing.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">위험등급</p>
                <p className="font-medium">{listing.riskGrade}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">계약기간</p>
                <p className="font-medium">{listing.contractPeriod}</p>
              </div>
            </div>

            <button
              onClick={() => handleBuySubmit(listing)}
              disabled={isLoading || !isConnected}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  구매하기 {!isConnected && '(지갑 연결 필요)'}
                </>
              )}
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
                  {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
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

        {/* 모바일 지갑 연결 */}
        <MobileWalletConnect
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onError={handleError}
          isConnected={isConnected}
          connectedAddress={connectedAccount}
        />
      </div>
    </div>
  );
}