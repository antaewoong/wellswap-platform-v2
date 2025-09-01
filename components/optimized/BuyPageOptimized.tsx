'use client';

import React, { memo } from 'react';
import { Search, Filter, ShoppingCart, TrendingUp } from 'lucide-react';
import {
  AnimatedCard,
  LoadingSpinner,
  AnimatedButton,
  FadeInAnimation,
  StaggerContainer,
  StaggerItem
} from '../animations/AnimationComponents';

interface ListingItem {
  id: string | number;
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
  status: 'available' | 'pending' | 'sold' | 'blockchain_pending';
  seller: string;
  listingDate: string;
  blockchainAssetId?: string;
  multisigStage?: number;
}

interface BuyPageOptimizedProps {
  t: any;
  listings: ListingItem[];
  filteredListings: ListingItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedInsurer: string;
  setSelectedInsurer: (insurer: string) => void;
  selectedRiskGrade: string;
  setSelectedRiskGrade: (grade: string) => void;
  handleBuyClick: (listing: ListingItem) => void;
  isLoading: boolean;
  isWeb3Connected: boolean;
  connectWalletWithAuth: () => void;
  globalCategories: string[];
  globalInsurers: string[];
}

const BuyPageOptimized = memo<BuyPageOptimizedProps>(({
  t,
  listings,
  filteredListings,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedInsurer,
  setSelectedInsurer,
  selectedRiskGrade,
  setSelectedRiskGrade,
  handleBuyClick,
  isLoading,
  isWeb3Connected,
  connectWalletWithAuth,
  globalCategories,
  globalInsurers
}) => {
  const riskGrades = ['A+', 'A', 'B+', 'B', 'C+', 'C'];

  return (
    <div className="space-y-8">
      <FadeInAnimation>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t?.buy?.title || '보험 자산 구매'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t?.buy?.subtitle || 'AI 검증된 보험 자산을 안전하게 구매하세요'}
          </p>
        </div>
      </FadeInAnimation>

      {/* 지갑 연결 알림 */}
      {!isWeb3Connected && (
        <AnimatedCard className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              지갑 연결이 필요합니다
            </h3>
            <p className="text-gray-600 mb-4">
              보험 자산을 구매하려면 Polygon 지갑을 연결해야 합니다
            </p>
            <AnimatedButton onClick={connectWalletWithAuth} className="bg-orange-600 hover:bg-orange-700">
              지갑 연결하기
            </AnimatedButton>
          </div>
        </AnimatedCard>
      )}

      {/* 검색 및 필터 */}
      <AnimatedCard>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="상품명 또는 회사명 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 카테고리 필터 */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 카테고리</option>
              {globalCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* 보험회사 필터 */}
            <select
              value={selectedInsurer}
              onChange={(e) => setSelectedInsurer(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 보험회사</option>
              {globalInsurers.map(insurer => (
                <option key={insurer} value={insurer}>{insurer}</option>
              ))}
            </select>

            {/* 위험등급 필터 */}
            <select
              value={selectedRiskGrade}
              onChange={(e) => setSelectedRiskGrade(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 위험등급</option>
              {riskGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredListings.length}개의 보험 자산을 찾았습니다
            </p>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">필터 적용됨</span>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* 보험 상품 리스트 */}
      <StaggerContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing, index) => (
            <StaggerItem key={listing.id}>
              <AnimatedCard className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* 상품 헤더 */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {listing.productName}
                      </h3>
                      <p className="text-sm text-gray-500">{listing.company}</p>
                    </div>
                    <div className="text-right">
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${listing.riskGrade.startsWith('A') ? 'bg-green-100 text-green-800' :
                          listing.riskGrade.startsWith('B') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {listing.riskGrade}
                      </div>
                    </div>
                  </div>

                  {/* 상품 정보 */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">카테고리:</span>
                      <span className="text-gray-900">{listing.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">계약기간:</span>
                      <span className="text-gray-900">{listing.contractPeriod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">납입기간:</span>
                      <span className="text-gray-900">{listing.paidPeriod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">신뢰도:</span>
                      <span className="text-gray-900">{listing.confidence}%</span>
                    </div>
                  </div>

                  {/* 가격 정보 */}
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">플랫폼 가격</p>
                        <p className="text-xl font-bold text-blue-600">
                          ${listing.platformPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">연간 보험료</p>
                        <p className="text-lg font-medium text-gray-900">
                          ${listing.annualPayment.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 상태 및 구매 버튼 */}
                  <div className="flex justify-between items-center">
                    <div className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${listing.status === 'available' ? 'bg-green-100 text-green-800' :
                        listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        listing.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'}
                    `}>
                      {listing.status === 'available' ? '구매 가능' :
                       listing.status === 'pending' ? '대기 중' :
                       listing.status === 'sold' ? '판매 완료' :
                       '블록체인 처리중'}
                    </div>

                    <AnimatedButton
                      onClick={() => handleBuyClick(listing)}
                      disabled={listing.status !== 'available' || !isWeb3Connected}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-lg transition-colors
                        ${listing.status === 'available' && isWeb3Connected
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                      `}
                    >
                      {listing.status === 'available' ? '구매하기' :
                       listing.status === 'pending' ? '대기중' :
                       listing.status === 'sold' ? '판매완료' :
                       '처리중'}
                    </AnimatedButton>
                  </div>

                  {/* 멀티시그 단계 표시 */}
                  {listing.multisigStage && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          멀티시그 단계 {listing.multisigStage}/4
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>

      {/* 로딩 표시 */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner className="w-8 h-8" />
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && filteredListings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500">
            다른 검색어나 필터를 시도해보세요
          </p>
        </div>
      )}
    </div>
  );
});

BuyPageOptimized.displayName = 'BuyPageOptimized';

export default BuyPageOptimized;