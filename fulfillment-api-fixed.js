// lib/fulfillment-api.js - AI 크롤링 API 파일 수정
class FulfillmentAPI {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_AI_SERVER_URL || 'https://wellswaphk.onrender.com';
  }

  async getValuationWeights(insurerName, productType, policyYear = 5) {
    try {
      console.log('AI 크롤링 시작:', { insurerName, productType, policyYear });
      
      // 실제 API 호출 (서버가 없을 경우 폴백)
      try {
        const response = await fetch(`${this.baseURL}/api/fulfillment/weights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            insurer: insurerName,
            product_type: productType,
            policy_year: policyYear
          }),
          timeout: 5000 // 5초 타임아웃
        });

        if (response.ok) {
          const data = await response.json();
          return {
            adjustmentFactor: data.adjustment_factor || this.getDefaultAdjustment(insurerName),
            reliabilityScore: data.reliability_score || this.getDefaultReliability(insurerName),
            recommendation: data.recommendation || this.getDefaultRecommendation(insurerName),
            marketTrends: data.market_trends || [],
            lastUpdated: data.last_updated || new Date().toISOString(),
            source: 'api'
          };
        }
      } catch (apiError) {
        console.warn('API 호출 실패, 폴백 데이터 사용:', apiError.message);
      }

      // API 실패 시 폴백 데이터 반환
      return this.getFallbackData(insurerName, productType);
    } catch (error) {
      console.error('AI 크롤링 완전 실패:', error);
      return this.getFallbackData(insurerName, productType);
    }
  }

  async triggerCrawling() {
    try {
      const response = await fetch(`${this.baseURL}/api/fulfillment/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: '크롤링이 시작되었습니다.',
          taskId: data.task_id || 'task_' + Date.now()
        };
      } else {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }
    } catch (error) {
      console.warn('크롤링 트리거 실패, 시뮬레이션 모드:', error.message);
      
      // 폴백: 시뮬레이션 응답
      return {
        success: true,
        message: '크롤링이 시뮬레이션 모드로 시작되었습니다.',
        taskId: 'sim_' + Date.now(),
        simulation: true
      };
    }
  }

  getDefaultAdjustment(insurerName) {
    const adjustmentMap = {
      'AIA Group Limited': 1.15,
      'Prudential plc': 1.12,
      'Manulife Financial': 1.08,
      'Great Eastern Holdings': 1.05,
      'Sun Life Financial': 1.10,
      'FWD Group': 1.03,
      'Zurich Insurance Group': 1.07,
      'AXA': 1.06,
      'Generali': 1.05,
      'Allianz': 1.07,
      'HSBC Life': 1.06,
      'BOC Life': 1.04,
      'China Life Insurance': 1.03
    };
    
    return adjustmentMap[insurerName] || 1.0;
  }

  getDefaultReliability(insurerName) {
    const reliabilityMap = {
      'AIA Group Limited': 0.95,
      'Prudential plc': 0.92,
      'Manulife Financial': 0.90,
      'Great Eastern Holdings': 0.87,
      'Sun Life Financial': 0.89,
      'FWD Group': 0.85,
      'Zurich Insurance Group': 0.88,
      'AXA': 0.86,
      'Generali': 0.85,
      'Allianz': 0.87,
      'HSBC Life': 0.84,
      'BOC Life': 0.82,
      'China Life Insurance': 0.80
    };
    
    return reliabilityMap[insurerName] || 0.75;
  }

  getDefaultRecommendation(insurerName) {
    const premiumInsurers = [
      'AIA Group Limited', 
      'Prudential plc', 
      'Manulife Financial',
      'Sun Life Financial',
      'Allianz'
    ];
    const cautionInsurers = [
      'FWD Group',
      'BOC Life',
      'China Life Insurance'
    ];
    
    if (premiumInsurers.includes(insurerName)) {
      return 'premium';
    } else if (cautionInsurers.includes(insurerName)) {
      return 'caution';
    } else {
      return 'standard';
    }
  }

  getFallbackData(insurerName, productType) {
    const baseData = {
      adjustmentFactor: this.getDefaultAdjustment(insurerName),
      reliabilityScore: this.getDefaultReliability(insurerName),
      recommendation: this.getDefaultRecommendation(insurerName),
      lastUpdated: new Date().toISOString(),
      source: 'fallback'
    };

    // 상품 타입별 특화 데이터
    const productSpecificData = {
      'Savings Plan': {
        marketTrends: [
          'Hong Kong savings products showing steady growth',
          'Low interest environment favoring insurance savings',
          'Regulatory changes supporting consumer protection'
        ]
      },
      'Pension Plan': {
        marketTrends: [
          'Aging population driving pension demand',
          'Government incentives for retirement planning',
          'Cross-border portability gaining importance'
        ]
      },
      'Investment Linked': {
        marketTrends: [
          'Market volatility affecting returns',
          'ESG investments gaining traction',
          'Digital platforms improving accessibility'
        ]
      },
      'Whole Life': {
        marketTrends: [
          'Traditional products maintaining popularity',
          'Multi-generational wealth planning focus',
          'Enhanced riders expanding coverage'
        ]
      }
    };

    return {
      ...baseData,
      marketTrends: productSpecificData[productType]?.marketTrends || [
        'Hong Kong insurance market remains stable',
        'Digital transformation accelerating',
        'Regulatory framework strengthening'
      ]
    };
  }

  // 디버깅용 상태 체크
  async checkStatus() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 3000
      });
      
      return {
        server: response.ok ? 'online' : 'error',
        url: this.baseURL,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        server: 'offline',
        url: this.baseURL,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

const fulfillmentAPI = new FulfillmentAPI();
export default fulfillmentAPI;