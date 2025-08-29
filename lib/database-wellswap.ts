// lib/database-wellswap.ts - 기존 테이블 구조에 맞춘 Database Service
import { createClient } from '@supabase/supabase-js';

// 환경 변수 직접 사용 (config를 거치지 않음)
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔍 Supabase 설정 확인:', {
    url: supabaseUrl ? '설정됨' : '설정되지 않음',
    key: supabaseKey ? '설정됨' : '설정되지 않음',
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseKey?.length || 0
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('URL:', supabaseUrl);
    console.error('KEY:', supabaseKey ? '설정됨' : '설정되지 않음');
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  return { supabaseUrl, supabaseKey };
};

// Supabase 클라이언트 생성
const createSupabaseClient = () => {
  try {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'wellswap'
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    console.log('✅ Supabase 클라이언트 생성 완료');
    return client;
  } catch (error) {
    console.error('❌ Supabase 클라이언트 생성 실패:', error);
    throw error;
  }
};

export const supabase = createSupabaseClient();

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Supabase 연결 테스트 시작...');
    
    // 간단한 쿼리로 연결 확인
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 연결 테스트 실패:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
    
    console.log('✅ Supabase 연결 테스트 성공');
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('❌ Supabase 연결 테스트 중 예외 발생:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 관리자 지갑 주소 목록
const ADMIN_WALLETS = [
  '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0', // 현재 연결된 지갑
  '0x1234567890123456789012345678901234567890', // 예시 주소
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',  // 예시 주소
  '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6', // 추가 관리자 주소
  '0x9b1a5f8709c6710650a010b4c9c16b1f9a5f8709', // 추가 관리자 주소
  '0x1a2b3c4d5e6f7890123456789012345678901234', // 추가 관리자 주소
  '0x5a6b7c8d9e0f1234567890123456789012345678', // 추가 관리자 주소
  '0x9c8b7a6f5e4d3c2b1a098765432109876543210'   // 추가 관리자 주소
]

// 사용자 권한 확인
export const checkUserRole = (walletAddress: string): 'admin' | 'user' => {
  if (!walletAddress) return 'user'
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase()) ? 'admin' : 'user'
}

// 에러 추적 함수
const trackError = (error: any, context: string) => {
  console.error(`[${context}] Error:`, error);
  // TODO: Sentry 또는 다른 에러 추적 서비스 연동
};

// 웹소켓 연결 상태 확인
export const checkWebSocketConnection = async () => {
  try {
    // 간단한 쿼리로 연결 확인
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.warn('⚠️ WebSocket 연결 확인 실패:', error);
      return false;
    }
    
    console.log('✅ WebSocket 연결 정상');
    return true;
  } catch (error) {
    console.error('❌ WebSocket 연결 확인 중 오류:', error);
    return false;
  }
};

// 사용자 관리
export class WellSwapDB {
  // 사용자 생성
  static async createUser(userData: {
    wallet_address: string;
    role?: string;
    reputation_score?: number;
    total_trades?: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          wallet_address: userData.wallet_address.toLowerCase(),
          role: userData.role || 'user',
          reputation_score: userData.reputation_score || 100,
          total_trades: userData.total_trades || 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        trackError(error, 'createUser');
      }

      return { data, error };
    } catch (error) {
      trackError(error, 'createUser');
      return { data: null, error };
    }
  }

  // 지갑 주소로 사용자 조회
  static async getUserByWallet(walletAddress: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (error) {
        trackError(error, 'getUserByWallet');
      }

      return { data, error };
    } catch (error) {
      trackError(error, 'getUserByWallet');
      return { data: null, error };
    }
  }

  // 보험 자산 생성
  static async createInsuranceAsset(assetData: {
    owner_address: string;
    company_name: string;
    product_name: string;
    product_category: string;
    policy_number: string;
    contract_date: string;
    contract_period_years: number;
    paid_period_years: number;
    annual_premium: number;
    total_paid: number;
    currency: string;
    asking_price: number;
    status: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('insurance_assets')
        .insert([{
          ...assetData,
          owner_address: assetData.owner_address.toLowerCase(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        trackError(error, 'createInsuranceAsset');
      }

      return { data, error };
    } catch (error) {
      trackError(error, 'createInsuranceAsset');
      return { data: null, error };
    }
  }

  // 보험 상태 업데이트
  static async updateInsuranceStatus(assetId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('insurance_assets')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', assetId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating insurance status:', error);
      return { data: null, error };
    }
  }

  // 거래 생성
  static async createTransaction(transactionData: {
    insurance_id: string;
    buyer_address: string;
    seller_address: string;
    purchase_price: number;
    payment_method: string;
    transaction_hash: string;
    status: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          buyer_address: transactionData.buyer_address.toLowerCase(),
          seller_address: transactionData.seller_address.toLowerCase(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { data: null, error };
    }
  }

  // AI 평가 결과 저장
  static async saveAIValuation(valuationData: {
    asset_id: string;
    surrender_value: number;
    transfer_value: number;
    platform_price: number;
    confidence_score: number;
    risk_grade: string;
    adjustment_factor: number;
    reliability_score: number;
    analysis_details: any;
  }) {
    try {
      const { data, error } = await supabase
        .from('ai_valuations')
        .insert([{
          ...valuationData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error saving AI valuation:', error);
      return { data: null, error };
    }
  }

  // 보험 자산 목록 조회
  static async getInsuranceAssets(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('insurance_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error getting insurance assets:', error);
      return { data: null, error };
    }
  }

  // 사용자 거래 내역 조회
  static async getUserTransactions(walletAddress: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          insurance_assets (
            company_name,
            product_name,
            asking_price
          )
        `)
        .or(`buyer_address.eq.${walletAddress.toLowerCase()},seller_address.eq.${walletAddress.toLowerCase()}`)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return { data: null, error };
    }
  }

  // 통계 데이터 조회
  static async getStatistics() {
    try {
      const [assetsResult, transactionsResult, usersResult] = await Promise.all([
        supabase.from('insurance_assets').select('id', { count: 'exact' }),
        supabase.from('transactions').select('id, purchase_price', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' })
      ]);

      // 총 거래량 계산
      const { data: completedTransactions } = await supabase
        .from('transactions')
        .select('purchase_price')
        .eq('status', 'completed');

      const totalVolume = completedTransactions?.reduce((sum, tx) => sum + tx.purchase_price, 0) || 0;

      return {
        data: {
          totalAssets: assetsResult.count || 0,
          totalTransactions: transactionsResult.count || 0,
          totalUsers: usersResult.count || 0,
          totalVolume
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { data: null, error };
    }
  }
}