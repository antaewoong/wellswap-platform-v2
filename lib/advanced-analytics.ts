// lib/advanced-analytics.ts - 고급 차트 및 분석 시스템
import { supabase } from './database-wellswap';

export interface MarketData {
  id: string;
  timestamp: string;
  total_volume: number;
  average_price: number;
  transaction_count: number;
  active_users: number;
  price_change_percent: number;
  volume_change_percent: number;
}

export interface AssetPerformance {
  asset_id: string;
  company_name: string;
  product_type: string;
  current_price: number;
  price_change: number;
  volume_24h: number;
  market_cap: number;
  liquidity_score: number;
  volatility: number;
}

export interface TradingPattern {
  pattern_type: 'trend' | 'reversal' | 'consolidation' | 'breakout';
  confidence: number;
  description: string;
  indicators: string[];
  recommendation: 'buy' | 'sell' | 'hold' | 'wait';
}

export interface RiskMetrics {
  asset_id: string;
  var_95: number; // Value at Risk (95% confidence)
  sharpe_ratio: number;
  beta: number;
  max_drawdown: number;
  correlation_matrix: Record<string, number>;
}

class AdvancedAnalyticsEngine {
  private marketDataCache: MarketData[] = [];
  private performanceCache: AssetPerformance[] = [];
  private riskMetricsCache: RiskMetrics[] = [];

  constructor() {
    this.initializeDataCollection();
  }

  // 데이터 수집 초기화
  private async initializeDataCollection() {
    console.log('📊 고급 분석 엔진 초기화 중...');
    
    // 초기 데이터 로드
    await this.loadMarketData();
    await this.calculatePerformanceMetrics();
    await this.calculateRiskMetrics();
    
    // 실시간 데이터 업데이트 (5분마다)
    setInterval(async () => {
      await this.updateAnalytics();
    }, 5 * 60 * 1000);
    
    console.log('✅ 고급 분석 엔진 초기화 완료');
  }

  // 시장 데이터 로드
  private async loadMarketData() {
    try {
      // market_data 테이블이 없으므로 기본 데이터 생성
      this.marketDataCache = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          total_volume: 1000000,
          average_price: 50000,
          transaction_count: 10,
          active_users: 5,
          price_change_percent: 2.5,
          volume_change_percent: 15.0
        }
      ];
      console.log('📈 시장 데이터 로드 완료 (기본 모드):', this.marketDataCache.length, '개');
    } catch (error) {
      console.error('❌ 시장 데이터 로드 실패:', error);
    }
  }

  // 성과 지표 계산
  private async calculatePerformanceMetrics() {
    try {
      // insurance_assets 테이블이 없으므로 기본 데이터 생성
      this.performanceCache = [
        {
          asset_id: '1',
          company_name: 'AIA Hong Kong',
          product_type: 'Life Insurance',
          current_price: 50000,
          price_change: 5.2,
          volume_24h: 250000,
          market_cap: 5000000,
          liquidity_score: 0.8,
          volatility: 0.12
        },
        {
          asset_id: '2',
          company_name: 'Prudential Hong Kong',
          product_type: 'Health Insurance',
          current_price: 35000,
          price_change: -2.1,
          volume_24h: 180000,
          market_cap: 3500000,
          liquidity_score: 0.7,
          volatility: 0.15
        }
      ];

      console.log('📊 성과 지표 계산 완료 (기본 모드):', this.performanceCache.length, '개');
    } catch (error) {
      console.error('❌ 성과 지표 계산 실패:', error);
    }
  }

  // 리스크 지표 계산
  private async calculateRiskMetrics() {
    try {
      this.riskMetricsCache = this.performanceCache.map(asset => {
        const returns = this.calculateHistoricalReturns(asset.asset_id);
        const var95 = this.calculateVaR(returns, 0.95);
        const sharpeRatio = this.calculateSharpeRatio(returns);
        const beta = this.calculateBeta(asset.asset_id);
        const maxDrawdown = this.calculateMaxDrawdown(returns);
        const correlationMatrix = this.calculateCorrelationMatrix(asset.asset_id);

        return {
          asset_id: asset.asset_id,
          var_95: var95,
          sharpe_ratio: sharpeRatio,
          beta: beta,
          max_drawdown: maxDrawdown,
          correlation_matrix: correlationMatrix
        };
      });

      console.log('⚠️ 리스크 지표 계산 완료:', this.riskMetricsCache.length, '개');
    } catch (error) {
      console.error('❌ 리스크 지표 계산 실패:', error);
    }
  }

  // 거래 패턴 분석
  public analyzeTradingPatterns(assetId: string): TradingPattern {
    const asset = this.performanceCache.find(a => a.asset_id === assetId);
    if (!asset) {
      return {
        pattern_type: 'consolidation',
        confidence: 0,
        description: '데이터 부족',
        indicators: [],
        recommendation: 'wait'
      };
    }

    const indicators: string[] = [];
    let patternType: TradingPattern['pattern_type'] = 'consolidation';
    let confidence = 0;
    let recommendation: TradingPattern['recommendation'] = 'hold';

    // 가격 변동 분석
    if (Math.abs(asset.price_change) > 10) {
      indicators.push('가격 급변');
      patternType = asset.price_change > 0 ? 'trend' : 'reversal';
      confidence += 30;
    }

    // 거래량 분석
    if (asset.volume_24h > 1000000) {
      indicators.push('거래량 급증');
      confidence += 25;
    }

    // 변동성 분석
    if (asset.volatility > 0.15) {
      indicators.push('높은 변동성');
      confidence += 20;
    }

    // 유동성 분석
    if (asset.liquidity_score > 0.8) {
      indicators.push('높은 유동성');
      confidence += 15;
    }

    // 추천 결정
    if (patternType === 'trend' && confidence > 60) {
      recommendation = asset.price_change > 0 ? 'buy' : 'sell';
    } else if (patternType === 'reversal' && confidence > 70) {
      recommendation = asset.price_change > 0 ? 'sell' : 'buy';
    } else if (confidence < 40) {
      recommendation = 'wait';
    }

    const descriptions = {
      trend: '명확한 상승/하락 추세가 관찰됩니다',
      reversal: '추세 전환이 예상됩니다',
      consolidation: '가격이 일정 범위에서 횡보하고 있습니다',
      breakout: '중요한 지지/저항선 돌파가 예상됩니다'
    };

    return {
      pattern_type: patternType,
      confidence: Math.min(confidence, 100),
      description: descriptions[patternType],
      indicators,
      recommendation
    };
  }

  // 시장 심리 지수 계산
  public calculateMarketSentiment(): number {
    if (this.performanceCache.length === 0) return 50;

    const positiveAssets = this.performanceCache.filter(a => a.price_change > 0).length;
    const totalAssets = this.performanceCache.length;
    const sentiment = (positiveAssets / totalAssets) * 100;

    return Math.round(sentiment);
  }

  // 포트폴리오 최적화 추천
  public getPortfolioRecommendations(): {
    highRisk: AssetPerformance[];
    mediumRisk: AssetPerformance[];
    lowRisk: AssetPerformance[];
  } {
    const sortedByRisk = this.performanceCache
      .map(asset => ({
        ...asset,
        riskScore: this.calculateRiskScore(asset.asset_id)
      }))
      .sort((a, b) => a.riskScore - b.riskScore);

    const third = Math.floor(sortedByRisk.length / 3);
    
    return {
      lowRisk: sortedByRisk.slice(0, third),
      mediumRisk: sortedByRisk.slice(third, third * 2),
      highRisk: sortedByRisk.slice(third * 2)
    };
  }

  // 실시간 분석 업데이트
  private async updateAnalytics() {
    await this.loadMarketData();
    await this.calculatePerformanceMetrics();
    await this.calculateRiskMetrics();
    console.log('🔄 분석 데이터 업데이트 완료');
  }

  // 헬퍼 함수들
  private calculatePriceChange(assetId: string): number {
    // 실제 구현에서는 과거 가격 데이터를 사용
    return Math.random() * 20 - 10; // 임시 구현
  }

  private calculate24hVolume(assetId: string): number {
    // 실제 구현에서는 24시간 거래량을 계산
    return Math.random() * 5000000; // 임시 구현
  }

  private calculateLiquidityScore(asset: any): number {
    // 유동성 점수 계산 (0-1)
    const factors = [
      asset.face_value > 1000000 ? 0.3 : 0.1,
      asset.asking_price > 50000 ? 0.3 : 0.1,
      asset.product_type === 'life' ? 0.4 : 0.2
    ];
    return Math.min(factors.reduce((sum, factor) => sum + factor, 0), 1);
  }

  private calculateVolatility(assetId: string): number {
    // 변동성 계산 (표준편차 기반)
    return Math.random() * 0.3; // 임시 구현
  }

  private calculateHistoricalReturns(assetId: string): number[] {
    // 과거 수익률 데이터 반환
    return Array.from({ length: 30 }, () => Math.random() * 0.1 - 0.05);
  }

  private calculateVaR(returns: number[], confidence: number): number {
    // Value at Risk 계산
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return sortedReturns[index] || 0;
  }

  private calculateSharpeRatio(returns: number[]): number {
    // 샤프 비율 계산
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    return stdDev > 0 ? avgReturn / stdDev : 0;
  }

  private calculateBeta(assetId: string): number {
    // 베타 계산
    return Math.random() * 2 - 0.5; // 임시 구현
  }

  private calculateMaxDrawdown(returns: number[]): number {
    // 최대 낙폭 계산
    let peak = 1;
    let maxDrawdown = 0;
    let cumulative = 1;

    for (const ret of returns) {
      cumulative *= (1 + ret);
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = (peak - cumulative) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  private calculateCorrelationMatrix(assetId: string): Record<string, number> {
    // 상관관계 행렬 계산
    return {
      'market_index': Math.random() * 2 - 1,
      'sector_index': Math.random() * 2 - 1,
      'risk_free_rate': Math.random() * 0.5
    };
  }

  private calculateRiskScore(assetId: string): number {
    const riskMetrics = this.riskMetricsCache.find(r => r.asset_id === assetId);
    if (!riskMetrics) return 0.5;

    // 리스크 점수 계산 (0-1, 높을수록 위험)
    const factors = [
      riskMetrics.var_95 * 10,
      (1 - riskMetrics.sharpe_ratio) * 0.5,
      Math.abs(riskMetrics.beta) * 0.3,
      riskMetrics.max_drawdown
    ];

    return Math.min(factors.reduce((sum, factor) => sum + factor, 0), 1);
  }

  // 공개 API
  public getMarketData(): MarketData[] {
    return this.marketDataCache;
  }

  public getPerformanceData(): AssetPerformance[] {
    return this.performanceCache;
  }

  public getRiskMetrics(): RiskMetrics[] {
    return this.riskMetricsCache;
  }

  public getTopPerformers(limit: number = 5): AssetPerformance[] {
    return this.performanceCache
      .sort((a, b) => b.price_change - a.price_change)
      .slice(0, limit);
  }

  public getMostVolatile(limit: number = 5): AssetPerformance[] {
    return this.performanceCache
      .sort((a, b) => b.volatility - a.volatility)
      .slice(0, limit);
  }

  public getMarketTrend(): 'bullish' | 'bearish' | 'neutral' {
    const sentiment = this.calculateMarketSentiment();
    if (sentiment > 60) return 'bullish';
    if (sentiment < 40) return 'bearish';
    return 'neutral';
  }
}

// 싱글톤 인스턴스
export const advancedAnalyticsEngine = new AdvancedAnalyticsEngine();
