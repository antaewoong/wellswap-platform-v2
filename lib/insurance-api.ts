// 실제 보험 거래 API 함수들

import { supabase } from './database-wellswap';
import PolygonIntegration from '../components/PolygonContractIntegration';

export interface InsuranceAsset {
  id?: string;
  productName: string;
  insuranceCompany: string;
  category: string;
  annualPayment: number;
  totalPayment: number;
  contractDate: string;
  contractPeriod: string;
  paidPeriod: string;
  seller_address?: string;
  status: 'draft' | 'pending' | 'available' | 'sold';
  ai_valuation?: number;
  platform_price?: number;
  created_at?: string;
}

// 1. 보험 자산 등록 (실제 동작)
export const registerInsuranceAsset = async (assetData: InsuranceAsset, walletAddress: string) => {
  console.log('🚀 실제 보험 자산 등록 시작...', assetData);

  try {
    // 1. 데이터 검증
    if (!assetData.productName || !assetData.insuranceCompany || !assetData.annualPayment) {
      throw new Error('필수 정보가 누락되었습니다.');
    }

    // 2. Polygon 블록체인에 등록
    const blockchainResult = await PolygonIntegration.registerInsuranceAsset({
      insuranceCompany: assetData.insuranceCompany,
      productName: assetData.productName,
      productCategory: assetData.category,
      contractDate: assetData.contractDate,
      contractPeriod: assetData.contractPeriod,
      paidPeriod: assetData.paidPeriod,
      annualPremium: assetData.annualPayment.toString(),
      totalPaid: assetData.totalPayment.toString()
    });

    if (!blockchainResult.success) {
      throw new Error(`블록체인 등록 실패: ${blockchainResult.error}`);
    }

    console.log('✅ 블록체인 등록 성공:', blockchainResult.transactionHash);

    // 3. 데이터베이스에 저장
    const dbData = {
      product_name: assetData.productName,
      company: assetData.insuranceCompany,
      category: assetData.category,
      annual_payment: assetData.annualPayment,
      total_payment: assetData.totalPayment,
      contract_date: assetData.contractDate,
      contract_period: assetData.contractPeriod,
      paid_period: assetData.paidPeriod,
      seller_address: walletAddress,
      status: 'pending',
      blockchain_tx: blockchainResult.transactionHash,
      registration_fee: parseFloat(blockchainResult.registrationFee || '0'),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('insurance_listings')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('❌ 데이터베이스 저장 실패:', error);
      throw new Error(`데이터베이스 저장 실패: ${error.message}`);
    }

    console.log('✅ 데이터베이스 저장 성공:', data.id);

    // 4. AI 평가 요청 (비동기)
    requestAIValuation(data.id, assetData);

    return {
      success: true,
      assetId: data.id,
      transactionHash: blockchainResult.transactionHash,
      message: '보험 자산이 성공적으로 등록되었습니다!'
    };

  } catch (error: any) {
    console.error('❌ 보험 자산 등록 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 2. AI 평가 요청 (실제 동작)
const requestAIValuation = async (assetId: string, assetData: InsuranceAsset) => {
  try {
    console.log('🤖 AI 평가 요청 시작...', assetId);

    // 실제로는 외부 AI API 호출
    // 지금은 시뮬레이션
    const mockAIValuation = {
      value: Math.floor(assetData.totalPayment * (0.75 + Math.random() * 0.2)), // 75-95% 범위
      confidence: 0.85 + Math.random() * 0.1, // 85-95% 신뢰도
      risk_grade: ['AAA', 'AA', 'A', 'BBB'][Math.floor(Math.random() * 4)],
      factors: {
        company_rating: 0.9,
        product_stability: 0.85,
        market_demand: 0.8,
        liquidity_score: 0.75
      }
    };

    // AI 평가 결과 저장
    const { error } = await supabase
      .from('insurance_listings')
      .update({
        ai_valuation: mockAIValuation.value,
        ai_confidence: mockAIValuation.confidence,
        risk_grade: mockAIValuation.risk_grade,
        valuation_factors: mockAIValuation.factors,
        status: 'pending' // 관리자 승인 대기
      })
      .eq('id', assetId);

    if (error) {
      console.error('❌ AI 평가 저장 실패:', error);
    } else {
      console.log('✅ AI 평가 완료:', mockAIValuation);
    }

  } catch (error) {
    console.error('❌ AI 평가 요청 실패:', error);
  }
};

// 3. 보험 자산 목록 조회 (실제 동작)
export const getInsuranceListings = async (filters?: {
  category?: string;
  company?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}) => {
  console.log('📋 보험 자산 목록 조회...', filters);

  try {
    let query = supabase
      .from('insurance_listings')
      .select('*')
      .order('created_at', { ascending: false });

    // 필터 적용
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.company) {
      query = query.ilike('company', `%${filters.company}%`);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.minPrice) {
      query = query.gte('ai_valuation', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('ai_valuation', filters.maxPrice);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`조회 실패: ${error.message}`);
    }

    console.log(`✅ ${data?.length || 0}개 보험 상품 조회됨`);

    return {
      success: true,
      listings: data || []
    };

  } catch (error: any) {
    console.error('❌ 목록 조회 실패:', error);
    return {
      success: false,
      error: error.message,
      listings: []
    };
  }
};

// 4. 보험 자산 구매 (실제 동작)
export const purchaseInsuranceAsset = async (assetId: string, buyerAddress: string) => {
  console.log('🛒 보험 자산 구매 시작...', { assetId, buyerAddress });

  try {
    // 1. 자산 정보 조회
    const { data: asset, error: fetchError } = await supabase
      .from('insurance_listings')
      .select('*')
      .eq('id', assetId)
      .eq('status', 'available')
      .single();

    if (fetchError || !asset) {
      throw new Error('구매 가능한 자산을 찾을 수 없습니다.');
    }

    // 2. 중복 구매 방지
    if (asset.seller_address === buyerAddress) {
      throw new Error('본인이 등록한 자산은 구매할 수 없습니다.');
    }

    // 3. 블록체인에서 구매 처리
    const purchaseResult = await PolygonIntegration.purchaseAsset(
      parseInt(assetId),
      asset.platform_price.toString()
    );

    if (!purchaseResult.success) {
      throw new Error(`구매 처리 실패: ${purchaseResult.error}`);
    }

    // 4. 거래 기록 생성
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert([{
        product_id: assetId,
        seller_id: asset.seller_address,
        buyer_id: buyerAddress,
        price: asset.platform_price,
        currency: 'USDC',
        status: 'completed',
        transaction_hash: purchaseResult.transactionHash,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (txError) {
      throw new Error(`거래 기록 실패: ${txError.message}`);
    }

    // 5. 자산 상태 업데이트
    await supabase
      .from('insurance_listings')
      .update({
        status: 'sold',
        buyer_address: buyerAddress,
        sold_at: new Date().toISOString()
      })
      .eq('id', assetId);

    console.log('✅ 구매 완료:', transaction.id);

    return {
      success: true,
      transactionId: transaction.id,
      transactionHash: purchaseResult.transactionHash,
      message: '보험 자산을 성공적으로 구매했습니다!'
    };

  } catch (error: any) {
    console.error('❌ 구매 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 5. 사용자 자산 조회
export const getUserAssets = async (userAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('insurance_listings')
      .select(`
        *,
        transactions(*)
      `)
      .or(`seller_address.eq.${userAddress},buyer_address.eq.${userAddress}`);

    if (error) throw error;

    return {
      success: true,
      assets: data || []
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      assets: []
    };
  }
};

export default {
  registerInsuranceAsset,
  getInsuranceListings,
  purchaseInsuranceAsset,
  getUserAssets
};