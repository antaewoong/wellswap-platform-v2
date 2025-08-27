// components/AdvancedCharts.tsx - 고급 차트 컴포넌트
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  advancedAnalyticsEngine, 
  AssetPerformance, 
  TradingPattern,
  RiskMetrics 
} from '../lib/advanced-analytics';

interface AdvancedChartsProps {
  assetId?: string;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ assetId }) => {
  const [performanceData, setPerformanceData] = useState<AssetPerformance[]>([]);
  const [tradingPattern, setTradingPattern] = useState<TradingPattern | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [marketSentiment, setMarketSentiment] = useState(50);
  const [marketTrend, setMarketTrend] = useState<'bullish' | 'bearish' | 'neutral'>('neutral');
  const [activeTab, setActiveTab] = useState<'performance' | 'analysis' | 'risk' | 'portfolio'>('performance');

  useEffect(() => {
    loadAnalyticsData();
    
    // 30초마다 데이터 업데이트
    const interval = setInterval(loadAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, [assetId]);

  const loadAnalyticsData = () => {
    setPerformanceData(advancedAnalyticsEngine.getPerformanceData());
    setMarketSentiment(advancedAnalyticsEngine.calculateMarketSentiment());
    setMarketTrend(advancedAnalyticsEngine.getMarketTrend());
    
    if (assetId) {
      setTradingPattern(advancedAnalyticsEngine.analyzeTradingPatterns(assetId));
      const metrics = advancedAnalyticsEngine.getRiskMetrics().find(r => r.asset_id === assetId);
      setRiskMetrics(metrics || null);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return 'text-green-600 bg-green-50 border-green-200';
      case 'sell': return 'text-red-600 bg-red-50 border-red-200';
      case 'hold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 70) return 'text-green-600';
    if (sentiment > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatPercentage = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">고급 분석 대시보드</h2>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTrendColor(marketTrend)}`}>
            {marketTrend === 'bullish' ? '📈 상승장' : 
             marketTrend === 'bearish' ? '📉 하락장' : '➡️ 횡보장'}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(marketSentiment)}`}>
            심리지수: {marketSentiment}%
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'performance', label: '성과 분석', icon: '📊' },
          { id: 'analysis', label: '거래 패턴', icon: '🔍' },
          { id: 'risk', label: '리스크 관리', icon: '⚠️' },
          { id: 'portfolio', label: '포트폴리오', icon: '💼' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="min-h-[400px]">
        {activeTab === 'performance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 상위 성과자 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">🏆 상위 성과자</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedAnalyticsEngine.getTopPerformers(6).map((asset, index) => (
                  <motion.div
                    key={asset.asset_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        #{index + 1}
                      </span>
                      <span className={`text-sm font-bold ${
                        asset.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(asset.price_change)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {asset.company_name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {asset.product_type}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>거래량: {formatNumber(asset.volume_24h)}</span>
                      <span>유동성: {(asset.liquidity_score * 100).toFixed(0)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 시장 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '총 거래량', value: formatNumber(performanceData.reduce((sum, a) => sum + a.volume_24h, 0)), icon: '💰' },
                { label: '평균 변동성', value: `${(performanceData.reduce((sum, a) => sum + a.volatility, 0) / performanceData.length * 100).toFixed(1)}%`, icon: '📈' },
                { label: '상승 종목', value: performanceData.filter(a => a.price_change > 0).length, icon: '🟢' },
                { label: '하락 종목', value: performanceData.filter(a => a.price_change < 0).length, icon: '🔴' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg text-center"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'analysis' && tradingPattern && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 거래 패턴 분석 */}
            <div className={`p-6 rounded-lg border ${getRecommendationColor(tradingPattern.recommendation)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">거래 패턴 분석</h3>
                <span className="text-sm font-medium">
                  신뢰도: {tradingPattern.confidence}%
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">패턴 유형:</span>
                  <span className="ml-2 font-semibold">
                    {tradingPattern.pattern_type === 'trend' ? '📈 추세' :
                     tradingPattern.pattern_type === 'reversal' ? '🔄 전환' :
                     tradingPattern.pattern_type === 'consolidation' ? '➡️ 횡보' : '💥 돌파'}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">설명:</span>
                  <p className="mt-1 text-sm">{tradingPattern.description}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">지표:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {tradingPattern.indicators.map((indicator, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">추천:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                    tradingPattern.recommendation === 'buy' ? 'bg-green-100 text-green-800' :
                    tradingPattern.recommendation === 'sell' ? 'bg-red-100 text-red-800' :
                    tradingPattern.recommendation === 'hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tradingPattern.recommendation === 'buy' ? '매수' :
                     tradingPattern.recommendation === 'sell' ? '매도' :
                     tradingPattern.recommendation === 'hold' ? '보유' : '대기'}
                  </span>
                </div>
              </div>
            </div>

            {/* 기술적 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'RSI', value: '65.2', status: 'neutral', icon: '📊' },
                { label: 'MACD', value: '0.023', status: 'bullish', icon: '📈' },
                { label: '볼린저 밴드', value: '중간', status: 'neutral', icon: '📏' },
                { label: '이동평균', value: '상승', status: 'bullish', icon: '📊' }
              ].map((indicator, index) => (
                <motion.div
                  key={indicator.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>{indicator.icon}</span>
                    <span className="font-medium">{indicator.label}</span>
                  </div>
                  <div className="text-lg font-bold text-gray-800">{indicator.value}</div>
                  <div className={`text-sm ${
                    indicator.status === 'bullish' ? 'text-green-600' :
                    indicator.status === 'bearish' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {indicator.status === 'bullish' ? '매수 신호' :
                     indicator.status === 'bearish' ? '매도 신호' : '중립'}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'risk' && riskMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 리스크 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">📊 리스크 지표</h3>
                {[
                  { label: 'VaR (95%)', value: `${(riskMetrics.var_95 * 100).toFixed(2)}%`, color: 'text-red-600' },
                  { label: '샤프 비율', value: riskMetrics.sharpe_ratio.toFixed(3), color: 'text-blue-600' },
                  { label: '베타', value: riskMetrics.beta.toFixed(3), color: 'text-green-600' },
                  { label: '최대 낙폭', value: `${(riskMetrics.max_drawdown * 100).toFixed(2)}%`, color: 'text-orange-600' }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                    <span className={`font-bold ${metric.color}`}>{metric.value}</span>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">🔗 상관관계</h3>
                {Object.entries(riskMetrics.correlation_matrix).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-600">
                      {key === 'market_index' ? '시장 지수' :
                       key === 'sector_index' ? '섹터 지수' : '무위험 수익률'}
                    </span>
                    <span className={`font-bold ${
                      Math.abs(value) > 0.7 ? 'text-red-600' :
                      Math.abs(value) > 0.3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {value.toFixed(3)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 리스크 경고 */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-600">⚠️</span>
                <h4 className="font-semibold text-red-800">리스크 경고</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {riskMetrics.var_95 > 0.1 && (
                  <li>• VaR이 10%를 초과하여 높은 손실 위험이 있습니다</li>
                )}
                {riskMetrics.sharpe_ratio < 0.5 && (
                  <li>• 샤프 비율이 낮아 위험 대비 수익률이 부족합니다</li>
                )}
                {Math.abs(riskMetrics.beta) > 1.2 && (
                  <li>• 베타가 높아 시장 변동성에 민감합니다</li>
                )}
                {riskMetrics.max_drawdown > 0.2 && (
                  <li>• 최대 낙폭이 20%를 초과하여 높은 변동성을 보입니다</li>
                )}
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === 'portfolio' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 포트폴리오 추천 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">💼 포트폴리오 추천</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { risk: 'low', title: '저위험', color: 'green', assets: advancedAnalyticsEngine.getPortfolioRecommendations().lowRisk },
                  { risk: 'medium', title: '중위험', color: 'yellow', assets: advancedAnalyticsEngine.getPortfolioRecommendations().mediumRisk },
                  { risk: 'high', title: '고위험', color: 'red', assets: advancedAnalyticsEngine.getPortfolioRecommendations().highRisk }
                ].map((category, index) => (
                  <motion.div
                    key={category.risk}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`p-4 border-2 rounded-lg ${
                      category.color === 'green' ? 'border-green-200 bg-green-50' :
                      category.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                      'border-red-200 bg-red-50'
                    }`}
                  >
                    <h4 className={`font-semibold mb-3 ${
                      category.color === 'green' ? 'text-green-800' :
                      category.color === 'yellow' ? 'text-yellow-800' : 'text-red-800'
                    }`}>
                      {category.title} 포트폴리오
                    </h4>
                    <div className="space-y-2">
                      {category.assets.slice(0, 3).map((asset, assetIndex) => (
                        <div key={asset.asset_id} className="flex justify-between items-center text-sm">
                          <span className="truncate">{asset.company_name}</span>
                          <span className={`font-medium ${
                            asset.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(asset.price_change)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                      총 {category.assets.length}개 종목
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 자산 배분 가이드 */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📋 자산 배분 가이드</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>저위험:</strong> 안정적인 수익을 원하는 투자자 (60-70%)</p>
                <p>• <strong>중위험:</strong> 적당한 위험을 감수하는 투자자 (20-30%)</p>
                <p>• <strong>고위험:</strong> 높은 수익을 추구하는 투자자 (10-20%)</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdvancedCharts;

