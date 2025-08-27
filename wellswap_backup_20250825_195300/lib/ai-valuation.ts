// lib/ai-valuation.ts - Advanced AI Valuation System
import { FulfillmentAPI } from './fulfillment-api';

interface ValuationInput {
  companyName: string;
  productType: string;
  surrenderValue: number;
  contractPeriod: number;
  annualPayment: number;
  totalPayment: number;
  marketConditions?: any;
  userProfile?: any;
}

interface ValuationResult {
  aiValueUSD: number;
  riskGrade: number;
  confidence: number;
  breakdown: {
    baseValue: number;
    marketAdjustment: number;
    riskAdjustment: number;
    liquidityAdjustment: number;
    regulatoryAdjustment: number;
  };
  factors: {
    companyStrength: number;
    productPerformance: number;
    marketVolatility: number;
    regulatoryRisk: number;
    liquidityScore: number;
  };
  recommendations: string[];
}

export class AdvancedAIValuation {
  private fulfillmentAPI: FulfillmentAPI;
  
  constructor() {
    this.fulfillmentAPI = new FulfillmentAPI();
  }

  // 고급 AI 평가 수행
  async performAdvancedValuation(input: ValuationInput): Promise<ValuationResult> {
    console.log('🤖 고급 AI 평가 시작:', input);
    
    try {
      // 1단계: 기본 가치 계산
      const baseValue = this.calculateBaseValue(input);
      
      // 2단계: 시장 조건 분석
      const marketAdjustment = await this.analyzeMarketConditions(input);
      
      // 3단계: 위험도 평가
      const riskAssessment = await this.assessRiskFactors(input);
      
      // 4단계: 유동성 분석
      const liquidityAnalysis = await this.analyzeLiquidity(input);
      
      // 5단계: 규제 환경 분석
      const regulatoryAnalysis = await this.analyzeRegulatoryEnvironment(input);
      
      // 6단계: 최종 가치 계산
      const finalValue = this.calculateFinalValue({
        baseValue,
        marketAdjustment,
        riskAssessment,
        liquidityAnalysis,
        regulatoryAnalysis
      });
      
      // 7단계: 신뢰도 계산
      const confidence = this.calculateConfidence({
        marketAdjustment,
        riskAssessment,
        liquidityAnalysis,
        regulatoryAnalysis
      });
      
      // 8단계: 위험 등급 결정
      const riskGrade = this.determineRiskGrade(riskAssessment);
      
      // 9단계: 권장사항 생성
      const recommendations = this.generateRecommendations({
        input,
        riskAssessment,
        liquidityAnalysis,
        regulatoryAnalysis
      });
      
      const result: ValuationResult = {
        aiValueUSD: Math.round(finalValue),
        riskGrade,
        confidence: Math.round(confidence * 100),
        breakdown: {
          baseValue: Math.round(baseValue),
          marketAdjustment: Math.round(marketAdjustment.adjustment),
          riskAdjustment: Math.round(riskAssessment.adjustment),
          liquidityAdjustment: Math.round(liquidityAnalysis.adjustment),
          regulatoryAdjustment: Math.round(regulatoryAnalysis.adjustment)
        },
        factors: {
          companyStrength: riskAssessment.companyStrength,
          productPerformance: riskAssessment.productPerformance,
          marketVolatility: marketAdjustment.volatility,
          regulatoryRisk: regulatoryAnalysis.riskLevel,
          liquidityScore: liquidityAnalysis.score
        },
        recommendations
      };
      
      console.log('✅ 고급 AI 평가 완료:', result);
      return result;
      
    } catch (error) {
      console.error('❌ AI 평가 실패:', error);
      throw error;
    }
  }

  // 기본 가치 계산 (복합 수학적 모델)
  private calculateBaseValue(input: ValuationInput): number {
    const { surrenderValue, contractPeriod, annualPayment, totalPayment } = input;
    
    // 1. 현재 가치 (Present Value) 계산
    const discountRate = 0.05; // 5% 할인율
    const presentValue = surrenderValue / Math.pow(1 + discountRate, contractPeriod);
    
    // 2. 미래 현금흐름 가치 계산
    const futureCashFlows = annualPayment * contractPeriod;
    const futureValue = futureCashFlows / Math.pow(1 + discountRate, contractPeriod);
    
    // 3. 투자 수익률 (ROI) 계산
    const totalInvestment = totalPayment;
    const expectedReturn = (surrenderValue + futureCashFlows - totalInvestment) / totalInvestment;
    
    // 4. 복합 가치 계산
    const baseValue = presentValue + futureValue + (expectedReturn * totalInvestment * 0.3);
    
    return Math.max(baseValue, surrenderValue * 0.8); // 최소값 보장
  }

  // 시장 조건 분석
  private async analyzeMarketConditions(input: ValuationInput) {
    try {
      // Fulfillment API에서 시장 데이터 가져오기
      const marketData = await this.fulfillmentAPI.getValuationWeights(
        input.companyName,
        input.productType,
        input.contractPeriod
      );
      
      // 시장 변동성 계산
      const volatility = this.calculateMarketVolatility(marketData);
      
      // 시장 조정 계수
      const adjustment = marketData.adjustmentFactor || 1.0;
      
      return {
        adjustment: adjustment,
        volatility: volatility,
        marketData
      };
    } catch (error) {
      console.warn('시장 조건 분석 실패, 기본값 사용:', error);
      return {
        adjustment: 1.0,
        volatility: 0.5,
        marketData: null
      };
    }
  }

  // 위험도 평가
  private async assessRiskFactors(input: ValuationInput) {
    const { companyName, productType, contractPeriod } = input;
    
    // 1. 회사 강도 평가
    const companyStrength = this.evaluateCompanyStrength(companyName);
    
    // 2. 상품 성과 평가
    const productPerformance = this.evaluateProductPerformance(productType);
    
    // 3. 계약 기간 위험도
    const durationRisk = this.evaluateDurationRisk(contractPeriod);
    
    // 4. 복합 위험도 계산
    const totalRisk = (companyStrength + productPerformance + durationRisk) / 3;
    const adjustment = 1.0 - (totalRisk * 0.2); // 위험도에 따른 조정
    
    return {
      adjustment: Math.max(adjustment, 0.7), // 최소 70% 보장
      companyStrength,
      productPerformance,
      durationRisk,
      totalRisk
    };
  }

  // 유동성 분석
  private async analyzeLiquidity(input: ValuationInput) {
    const { productType, contractPeriod } = input;
    
    // 1. 상품 유형별 유동성 점수
    const productLiquidity = this.getProductLiquidityScore(productType);
    
    // 2. 계약 기간별 유동성 영향
    const durationLiquidity = this.getDurationLiquidityScore(contractPeriod);
    
    // 3. 시장 유동성 지수
    const marketLiquidity = await this.getMarketLiquidityIndex();
    
    // 4. 복합 유동성 점수
    const score = (productLiquidity + durationLiquidity + marketLiquidity) / 3;
    const adjustment = 0.8 + (score * 0.4); // 80%~120% 범위
    
    return {
      adjustment: Math.max(adjustment, 0.6),
      score,
      productLiquidity,
      durationLiquidity,
      marketLiquidity
    };
  }

  // 규제 환경 분석
  private async analyzeRegulatoryEnvironment(input: ValuationInput) {
    const { companyName, productType } = input;
    
    // 1. 규제 준수도 평가
    const complianceScore = await this.evaluateRegulatoryCompliance(companyName);
    
    // 2. 규제 위험도 계산
    const regulatoryRisk = this.calculateRegulatoryRisk(productType);
    
    // 3. 규제 조정 계수
    const adjustment = 1.0 - (regulatoryRisk * 0.1);
    
    return {
      adjustment: Math.max(adjustment, 0.9),
      riskLevel: regulatoryRisk,
      complianceScore
    };
  }

  // 최종 가치 계산
  private calculateFinalValue(components: any): number {
    const { baseValue, marketAdjustment, riskAssessment, liquidityAnalysis, regulatoryAnalysis } = components;
    
    // 가중 평균 계산
    const finalValue = baseValue * 
      marketAdjustment.adjustment * 
      riskAssessment.adjustment * 
      liquidityAnalysis.adjustment * 
      regulatoryAnalysis.adjustment;
    
    return finalValue;
  }

  // 신뢰도 계산
  private calculateConfidence(components: any): number {
    const { marketAdjustment, riskAssessment, liquidityAnalysis, regulatoryAnalysis } = components;
    
    // 각 요소의 신뢰도 가중 평균
    const confidence = (
      (marketAdjustment.marketData ? 0.9 : 0.6) * 0.3 +
      (riskAssessment.totalRisk < 0.5 ? 0.9 : 0.7) * 0.3 +
      (liquidityAnalysis.score > 0.7 ? 0.9 : 0.7) * 0.2 +
      (regulatoryAnalysis.complianceScore > 0.8 ? 0.9 : 0.7) * 0.2
    );
    
    return Math.min(confidence, 0.95); // 최대 95%
  }

  // 위험 등급 결정
  private determineRiskGrade(riskAssessment: any): number {
    const { totalRisk } = riskAssessment;
    
    if (totalRisk < 0.3) return 1; // A등급
    if (totalRisk < 0.5) return 2; // B등급
    if (totalRisk < 0.7) return 3; // C등급
    return 4; // D등급
  }

  // 권장사항 생성
  private generateRecommendations(data: any): string[] {
    const { input, riskAssessment, liquidityAnalysis, regulatoryAnalysis } = data;
    const recommendations = [];
    
    if (riskAssessment.totalRisk > 0.6) {
      recommendations.push('High risk product - consider additional due diligence');
    }
    
    if (liquidityAnalysis.score < 0.5) {
      recommendations.push('Low liquidity - longer holding period recommended');
    }
    
    if (regulatoryAnalysis.riskLevel > 0.7) {
      recommendations.push('Regulatory concerns - verify compliance status');
    }
    
    if (input.contractPeriod > 10) {
      recommendations.push('Long-term contract - consider market volatility');
    }
    
    return recommendations;
  }

  // 헬퍼 함수들
  private calculateMarketVolatility(marketData: any): number {
    return marketData.volatility || 0.5;
  }

  private evaluateCompanyStrength(companyName: string): number {
    const strongCompanies = ['AIA', 'Prudential', 'Great Eastern', 'Manulife'];
    return strongCompanies.includes(companyName) ? 0.9 : 0.7;
  }

  private evaluateProductPerformance(productType: string): number {
    const highPerformanceProducts = ['Whole Life', 'Endowment', 'Investment Linked'];
    return highPerformanceProducts.includes(productType) ? 0.8 : 0.6;
  }

  private evaluateDurationRisk(contractPeriod: number): number {
    if (contractPeriod <= 5) return 0.3;
    if (contractPeriod <= 10) return 0.5;
    if (contractPeriod <= 15) return 0.7;
    return 0.9;
  }

  private getProductLiquidityScore(productType: string): number {
    const liquidityScores: { [key: string]: number } = {
      'Investment Linked': 0.9,
      'Endowment': 0.8,
      'Whole Life': 0.7,
      'Term Life': 0.6,
      'Annuity': 0.5
    };
    return liquidityScores[productType] || 0.6;
  }

  private getDurationLiquidityScore(contractPeriod: number): number {
    if (contractPeriod <= 3) return 0.9;
    if (contractPeriod <= 7) return 0.8;
    if (contractPeriod <= 10) return 0.7;
    return 0.5;
  }

  private async getMarketLiquidityIndex(): Promise<number> {
    // 실제 시장 데이터 API 호출 (목업)
    return 0.75;
  }

  private async evaluateRegulatoryCompliance(companyName: string): Promise<number> {
    // 실제 규제 데이터 API 호출 (목업)
    return 0.85;
  }

  private calculateRegulatoryRisk(productType: string): number {
    const regulatoryRisks: { [key: string]: number } = {
      'Investment Linked': 0.3,
      'Endowment': 0.2,
      'Whole Life': 0.4,
      'Term Life': 0.1,
      'Annuity': 0.5
    };
    return regulatoryRisks[productType] || 0.3;
  }
}

// 싱글톤 인스턴스
export const advancedAIValuation = new AdvancedAIValuation();
