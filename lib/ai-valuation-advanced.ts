// lib/ai-valuation-advanced.ts - 고도화된 AI 가치평가 시스템
// "시간을 사고 팔다" - 금융부동산 개념의 보험 가치평가

export interface AdvancedValuationParams {
  // 기본 보험 정보
  company: string;
  productName: string;
  productCategory: string;
  contractPeriod: number; // 년
  paidYears: number; // 납입 년수
  annualPayment: number; // 연납 보험료
  totalPayment: number; // 총 납입금액
  surrenderValue: number; // 해지환급금
  
  // 시간 프리미엄 계산
  remainingYears: number; // 잔여 납입 년수
  timeValueMultiplier: number; // 시간 가치 승수
  
  // 시장 데이터
  marketInterestRate: number; // 시장 금리
  inflationRate: number; // 인플레이션율
  riskFreeRate: number; // 무위험 금리
  
  // 이행률 데이터
  fulfillmentRate?: number; // 개별 이행률 (없으면 평균 사용)
  industryAverageFulfillment: number; // 업계 평균 이행률
  
  // 심리적 요인
  psychologicalBarrier: number; // 심리적 허들 감소율
  liquidityPremium: number; // 유동성 프리미엄
  
  // 거래 활성화 요인
  marketLiquidity: number; // 시장 유동성
  transactionVolume: number; // 거래량
}

export interface AdvancedValuationResult {
  // 기본 가치
  baseValue: number;
  surrenderValue: number;
  
  // 시간 프리미엄
  timePremium: number;
  psychologicalValue: number;
  
  // 시장 가치
  marketValue: number;
  adjustedValue: number;
  
  // 거래 가치
  transactionValue: number;
  liquidityValue: number;
  
  // 최종 가치
  finalValue: number;
  premiumRate: number; // 프리미엄율
  
  // 분석 데이터
  analysis: {
    timeValue: string;
    psychologicalBenefit: string;
    marketOpportunity: string;
    riskAssessment: string;
  };
}

// 고도화된 AI 가치평가 엔진
export class AdvancedAIValuationEngine {
  
  // 시간 프리미엄 계산
  private calculateTimePremium(params: AdvancedValuationParams): number {
    const { remainingYears, timeValueMultiplier, psychologicalBarrier } = params;
    
    // 시간 가치 = 잔여 년수 × 시간 가치 승수 × 심리적 허들 감소율
    const timeValue = remainingYears * timeValueMultiplier * (1 + psychologicalBarrier);
    
    // 복리 효과 적용
    const compoundEffect = Math.pow(1.05, remainingYears); // 5% 복리 가정
    
    return timeValue * compoundEffect;
  }
  
  // 심리적 가치 계산
  private calculatePsychologicalValue(params: AdvancedValuationParams): number {
    const { contractPeriod, paidYears, annualPayment, psychologicalBarrier } = params;
    
    // 납입 부담 감소 가치
    const remainingBurden = (contractPeriod - paidYears) * annualPayment;
    const burdenReduction = remainingBurden * psychologicalBarrier;
    
    // 즉시 유동성 확보 가치
    const immediateLiquidity = params.surrenderValue * 0.8; // 80% 유동성 가정
    
    return burdenReduction + immediateLiquidity;
  }
  
  // 시장 가치 계산
  private calculateMarketValue(params: AdvancedValuationParams): number {
    const { marketInterestRate, inflationRate, riskFreeRate, marketLiquidity } = params;
    
    // 시장 금리 차익
    const interestDifferential = marketInterestRate - riskFreeRate;
    
    // 인플레이션 보호 가치
    const inflationProtection = params.totalPayment * (inflationRate * 0.5);
    
    // 시장 유동성 프리미엄
    const liquidityValue = params.surrenderValue * marketLiquidity;
    
    return interestDifferential + inflationProtection + liquidityValue;
  }
  
  // 이행률 조정
  private adjustForFulfillmentRate(params: AdvancedValuationParams): number {
    const fulfillmentRate = params.fulfillmentRate || params.industryAverageFulfillment;
    
    // 이행률이 낮을수록 가치 상승 (납입 중단 위험)
    const fulfillmentAdjustment = 1 + (0.5 - fulfillmentRate) * 0.3;
    
    return Math.max(fulfillmentAdjustment, 0.7); // 최소 70% 보장
  }
  
  // 거래 활성화 가치 계산
  private calculateTransactionValue(params: AdvancedValuationParams): number {
    const { transactionVolume, marketLiquidity } = params;
    
    // 거래량 기반 프리미엄
    const volumePremium = Math.log(transactionVolume + 1) * 0.1;
    
    // 시장 유동성 프리미엄
    const liquidityPremium = marketLiquidity * 0.15;
    
    return volumePremium + liquidityPremium;
  }
  
  // 메인 가치평가 함수
  public evaluateValue(params: AdvancedValuationParams): AdvancedValuationResult {
    // 기본 가치
    const baseValue = params.surrenderValue;
    
    // 시간 프리미엄
    const timePremium = this.calculateTimePremium(params);
    
    // 심리적 가치
    const psychologicalValue = this.calculatePsychologicalValue(params);
    
    // 시장 가치
    const marketValue = this.calculateMarketValue(params);
    
    // 이행률 조정
    const fulfillmentAdjustment = this.adjustForFulfillmentRate(params);
    
    // 거래 가치
    const transactionValue = this.calculateTransactionValue(params);
    
    // 조정된 가치
    const adjustedValue = (baseValue + timePremium + psychologicalValue + marketValue) * fulfillmentAdjustment;
    
    // 유동성 가치
    const liquidityValue = adjustedValue * 0.1; // 10% 유동성 프리미엄
    
    // 최종 가치
    const finalValue = adjustedValue + transactionValue + liquidityValue;
    
    // 프리미엄율 계산
    const premiumRate = ((finalValue - baseValue) / baseValue) * 100;
    
    return {
      baseValue,
      surrenderValue: params.surrenderValue,
      timePremium,
      psychologicalValue,
      marketValue,
      adjustedValue,
      transactionValue,
      liquidityValue,
      finalValue,
      premiumRate,
      analysis: {
        timeValue: `시간 프리미엄: ${timePremium.toLocaleString()}원 (잔여 ${params.remainingYears}년)`,
        psychologicalBenefit: `심리적 가치: ${psychologicalValue.toLocaleString()}원 (납입 부담 감소)`,
        marketOpportunity: `시장 기회: ${marketValue.toLocaleString()}원 (금리/인플레이션 보호)`,
        riskAssessment: `이행률 조정: ${(fulfillmentAdjustment * 100).toFixed(1)}% (${params.fulfillmentRate ? '개별' : '업계평균'} 기준)`
      }
    };
  }
  
  // 시나리오별 가치 분석
  public analyzeScenarios(params: AdvancedValuationParams): {
    optimistic: AdvancedValuationResult;
    realistic: AdvancedValuationResult;
    conservative: AdvancedValuationResult;
  } {
    // 낙관적 시나리오
    const optimisticParams = {
      ...params,
      timeValueMultiplier: params.timeValueMultiplier * 1.2,
      psychologicalBarrier: params.psychologicalBarrier * 1.3,
      marketLiquidity: params.marketLiquidity * 1.2
    };
    
    // 현실적 시나리오 (기본)
    const realisticParams = params;
    
    // 보수적 시나리오
    const conservativeParams = {
      ...params,
      timeValueMultiplier: params.timeValueMultiplier * 0.8,
      psychologicalBarrier: params.psychologicalBarrier * 0.7,
      marketLiquidity: params.marketLiquidity * 0.8
    };
    
    return {
      optimistic: this.evaluateValue(optimisticParams),
      realistic: this.evaluateValue(realisticParams),
      conservative: this.evaluateValue(conservativeParams)
    };
  }
}

// 싱글톤 인스턴스
export const advancedValuationEngine = new AdvancedAIValuationEngine();

