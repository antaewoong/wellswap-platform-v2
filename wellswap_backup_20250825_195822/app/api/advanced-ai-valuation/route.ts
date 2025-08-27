// app/api/advanced-ai-valuation/route.ts
// WellSwap 보험수학 기반 가치평가 엔진 (비용 ZERO)
// 홍콩 보험 MVA + 보험계리학 + 수학적 모델

import { NextRequest, NextResponse } from 'next/server';
import { advancedValuationEngine, AdvancedValuationParams } from '../../../lib/ai-valuation-advanced';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 기본 파라미터 검증
    const {
      company,
      productName,
      productCategory,
      contractPeriod,
      paidYears,
      annualPayment,
      totalPayment,
      surrenderValue,
      // 추가 파라미터들
      fulfillmentRate,
      marketInterestRate = 3.5, // 기본 시장 금리
      inflationRate = 2.0, // 기본 인플레이션율
      riskFreeRate = 2.0, // 기본 무위험 금리
    } = body;

    // 필수 파라미터 검증
    if (!company || !productName || !contractPeriod || !annualPayment || !surrenderValue) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 고도화된 가치평가 파라미터 구성
    const valuationParams: AdvancedValuationParams = {
      company,
      productName,
      productCategory: productCategory || 'Savings Plan',
      contractPeriod,
      paidYears: paidYears || 0,
      annualPayment,
      totalPayment: totalPayment || (annualPayment * contractPeriod),
      surrenderValue,
      
      // 시간 프리미엄 계산
      remainingYears: contractPeriod - (paidYears || 0),
      timeValueMultiplier: 1.2, // 시간 가치 승수
      
      // 시장 데이터
      marketInterestRate,
      inflationRate,
      riskFreeRate,
      
      // 이행률 데이터
      fulfillmentRate,
      industryAverageFulfillment: 0.75, // 업계 평균 이행률
      
      // 심리적 요인
      psychologicalBarrier: 0.15, // 심리적 허들 감소율
      liquidityPremium: 0.1, // 유동성 프리미엄
      
      // 거래 활성화 요인
      marketLiquidity: 0.8, // 시장 유동성
      transactionVolume: 1000, // 거래량
    };

    // 고도화된 가치평가 실행
    const result = advancedValuationEngine.evaluateValue(valuationParams);
    
    // 시나리오별 분석
    const scenarios = advancedValuationEngine.analyzeScenarios(valuationParams);

    // 응답 데이터 구성
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      input: {
        company,
        productName,
        productCategory: valuationParams.productCategory,
        contractPeriod,
        paidYears: valuationParams.paidYears,
        annualPayment,
        totalPayment: valuationParams.totalPayment,
        surrenderValue,
        remainingYears: valuationParams.remainingYears
      },
      valuation: {
        // 기본 가치
        baseValue: result.baseValue,
        surrenderValue: result.surrenderValue,
        
        // 시간 프리미엄
        timePremium: result.timePremium,
        psychologicalValue: result.psychologicalValue,
        
        // 시장 가치
        marketValue: result.marketValue,
        adjustedValue: result.adjustedValue,
        
        // 거래 가치
        transactionValue: result.transactionValue,
        liquidityValue: result.liquidityValue,
        
        // 최종 가치
        finalValue: result.finalValue,
        premiumRate: result.premiumRate,
        
        // 분석 데이터
        analysis: result.analysis
      },
      scenarios: {
        optimistic: {
          finalValue: scenarios.optimistic.finalValue,
          premiumRate: scenarios.optimistic.premiumRate
        },
        realistic: {
          finalValue: scenarios.realistic.finalValue,
          premiumRate: scenarios.realistic.premiumRate
        },
        conservative: {
          finalValue: scenarios.conservative.finalValue,
          premiumRate: scenarios.conservative.premiumRate
        }
      },
      businessInsights: {
        // 금융부동산 개념 분석
        timeValueProposition: `잔여 ${valuationParams.remainingYears}년의 시간 가치를 ${result.timePremium.toLocaleString()}원으로 평가`,
        psychologicalBenefit: `납입 부담 감소로 인한 심리적 가치 ${result.psychologicalValue.toLocaleString()}원`,
        marketOpportunity: `시장 기회 가치 ${result.marketValue.toLocaleString()}원 (금리/인플레이션 보호)`,
        liquidityAdvantage: `즉시 유동성 확보로 인한 가치 ${result.liquidityValue.toLocaleString()}원`,
        
        // 거래 활성화 분석
        sellerBenefit: `매도자: 해지환급금 대비 ${result.premiumRate.toFixed(1)}% 프리미엄 수익`,
        buyerBenefit: `매수자: 시간 프리미엄으로 납입 부담 감소`,
        marketLiquidity: `시장 유동성: ${(valuationParams.marketLiquidity * 100).toFixed(0)}%`,
        
        // 리스크 분석
        fulfillmentRisk: fulfillmentRate ? 
          `개별 이행률 ${(fulfillmentRate * 100).toFixed(1)}% 적용` : 
          `업계 평균 이행률 ${(valuationParams.industryAverageFulfillment * 100).toFixed(1)}% 적용`,
        riskAssessment: result.analysis.riskAssessment
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI 가치평가 오류:', error);
    return NextResponse.json(
      { 
        error: 'AI 가치평가 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WellSwap 고도화된 AI 가치평가 API',
    version: '2.0',
    features: [
      '시간 프리미엄 계산',
      '심리적 가치 평가',
      '시장 기회 분석',
      '이행률 조정',
      '시나리오별 분석',
      '금융부동산 개념 적용'
    ],
    usage: 'POST /api/advanced-ai-valuation with insurance data'
  });
}
