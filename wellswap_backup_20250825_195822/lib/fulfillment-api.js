// lib/fulfillment-api.js
class FulfillmentAPI {
  constructor() {
    this.baseURL = 'https://wellswap-fulfillment-crawler.onrender.com';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5분 캐시
  }

  getCacheKey(insurerName, productType, policyYear) {
    return `${insurerName}-${productType}-${policyYear}`.toLowerCase();
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getValuationWeights(insurerName, productType, policyYear = 5) {
    const cacheKey = this.getCacheKey(insurerName, productType, policyYear);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      console.log('Using cached fulfillment data');
      return cached;
    }

    try {
      console.log('Fetching fresh fulfillment data...');
      
      // 실시간 크롤링 데이터 요청
      const response = await fetch(`${this.baseURL}/api/weights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insurerName,
          productType,
          policyYear
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const weights = this.calculateWeights(data.fulfillmentData || []);
      
      this.setCache(cacheKey, weights);
      return weights;

    } catch (error) {
      console.error('Fulfillment API error:', error);
      return this.getDefaultWeights(insurerName);
    }
  }

  calculateWeights(fulfillmentData) {
    if (!fulfillmentData || fulfillmentData.length === 0) {
      return {
        adjustmentFactor: 1.0,
        reliabilityScore: 0.7,
        recommendation: 'insufficient_data',
        details: {
          dataAvailable: false,
          lastUpdate: null,
          source: 'default'
        }
      };
    }

    const sortedData = fulfillmentData.sort((a, b) => 
      new Date(b.crawled_at) - new Date(a.crawled_at)
    );

    const latestData = sortedData[0];
    
    const avgDividendRatio = (
      (latestData.annual_dividend_ratio || 0) +
      (latestData.reversionary_bonus_ratio || 0) +
      (latestData.terminal_dividend_ratio || 0)
    ) / 3;

    let adjustmentFactor = 1.0;
    if (avgDividendRatio >= 90) {
      adjustmentFactor = 1.15;
    } else if (avgDividendRatio >= 85) {
      adjustmentFactor = 1.05;
    } else if (avgDividendRatio >= 80) {
      adjustmentFactor = 1.0;
    } else if (avgDividendRatio >= 75) {
      adjustmentFactor = 0.95;
    } else {
      adjustmentFactor = 0.85;
    }

    const reliabilityScore = Math.min(
      (latestData.data_quality_score || 0.7) + 
      (avgDividendRatio / 100) * 0.3, 
      1.0
    );

    let recommendation = 'standard';
    if (adjustmentFactor >= 1.1) recommendation = 'premium';
    else if (adjustmentFactor >= 1.0) recommendation = 'recommended';
    else if (adjustmentFactor >= 0.9) recommendation = 'caution';
    else recommendation = 'avoid';

    return {
      adjustmentFactor,
      reliabilityScore,
      recommendation,
      details: {
        dataAvailable: true,
        avgDividendRatio,
        lastUpdate: latestData.crawled_at,
        source: 'hk_regulator_crawling',
        recordsAnalyzed: fulfillmentData.length,
        dataQuality: latestData.data_quality_score || 0.7
      }
    };
  }

  getDefaultWeights(insurerName) {
    const knownInsurerScores = {
      'AIA': { factor: 1.05, score: 0.85 },
      'Prudential': { factor: 1.03, score: 0.82 },
      'Manulife': { factor: 1.0, score: 0.8 },
      'Great Eastern': { factor: 0.98, score: 0.78 },
      'FTLife': { factor: 0.95, score: 0.75 }
    };

    const matchedInsurer = Object.keys(knownInsurerScores).find(
      key => insurerName.toUpperCase().includes(key.toUpperCase())
    );

    const defaultValues = matchedInsurer 
      ? knownInsurerScores[matchedInsurer]
      : { factor: 1.0, score: 0.7 };

    return {
      adjustmentFactor: defaultValues.factor,
      reliabilityScore: defaultValues.score,
      recommendation: 'standard',
      details: {
        dataAvailable: false,
        lastUpdate: null,
        source: 'default_rating',
        note: matchedInsurer ? 'Known insurer default rating' : 'General insurer default rating'
      }
    };
  }

  async triggerCrawling() {
    try {
      const response = await fetch(`${this.baseURL}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Crawling failed: ${response.status}`);
      }

      const result = await response.json();
      this.cache.clear();
      return result;
    } catch (error) {
      console.error('Crawling trigger error:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const fulfillmentAPI = new FulfillmentAPI();

export { fulfillmentAPI as FulfillmentAPI };
export default fulfillmentAPI;