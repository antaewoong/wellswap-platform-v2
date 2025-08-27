// lib/database-wellswap.ts 파일 상단 수정
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pecoffojfjcbrfwmaron.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlY29mZm9qZmpjYnJmd21hcm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTU4NjgsImV4cCI6MjA3MDYzMTg2OH0.Z1IOyinRwos7u8jzETU22a5cgMeCPFQQssOiPrH2vv8';

if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// lib/database-wellswap.ts - 기존 테이블 구조에 맞춘 Database Service
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 기존 테이블 구조에 맞춘 Types
export interface User {
  id: string;
  wallet_address?: string;
  email?: string;
  full_name?: string;
  role: 'user' | 'admin';
  reputation_score?: number;
  total_trades?: number;
  created_at: string;
  updated_at?: string;
}

export interface InsuranceAsset {
  id: string;
  owner_id: string;
  company_name: string;
  product_name: string;
  product_category: string;
  policy_number?: string;
  contract_date?: string;
  contract_period_years?: number;
  paid_period_years?: number;
  annual_premium?: number;
  total_paid?: number;
  currency: string;
  status: 'draft' | 'analyzing' | 'listed' | 'sold' | 'withdrawn';
  asking_price?: number;
  view_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface AIValuation {
  id: string;
  asset_id: string;
  surrender_value?: number;
  transfer_value?: number;
  platform_price?: number;
  confidence_score?: number;
  risk_grade?: string;
  adjustment_factor?: number;
  reliability_score?: number;
  analysis_details?: any;
  created_at: string;
}

export interface Transaction {
  id: string;
  asset_id: string;
  seller_id: string;
  buyer_id: string;
  blockchain_tx_hash?: string;
  amount_usd: number;
  amount_bnb?: number;
  status: 'pending' | 'escrow' | 'completed' | 'cancelled';
  blockchain_network?: string;
  created_at: string;
  completed_at?: string;
}

export interface PlatformStats {
  total_users: number;
  total_assets: number;
  total_transactions: number;
  total_volume_usd: number;
  active_listings: number;
  success_rate: number;
}

// Database Service Class
export class WellSwapDB {
  
  // ===== USER OPERATIONS =====
  
  static async createUser(userData: Partial<User>): Promise<{ data: User | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          role: userData.role || 'user',
          reputation_score: userData.reputation_score || 100,
          total_trades: userData.total_trades || 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error creating user:', error);
      return { data: null, error };
    }
  }

  static async getUserByWallet(walletAddress: string): Promise<{ data: User | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error getting user by wallet:', error);
      return { data: null, error };
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<{ data: User | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error updating user:', error);
      return { data: null, error };
    }
  }

  static async isAdmin(walletAddress: string): Promise<boolean> {
    try {
      const { data } = await this.getUserByWallet(walletAddress);
      return data?.role === 'admin' || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // ===== INSURANCE ASSET OPERATIONS =====

  static async createInsuranceAsset(assetData: Partial<InsuranceAsset>): Promise<{ data: InsuranceAsset | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('insurance_assets')
        .insert([{
          ...assetData,
          currency: assetData.currency || 'USD',
          status: assetData.status || 'draft',
          view_count: 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error creating insurance asset:', error);
      return { data: null, error };
    }
  }

  static async getListedAssets(limit: number = 50, offset: number = 0): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('insurance_assets')
        .select(`
          *,
          owner:users(id, full_name, reputation_score, total_trades, wallet_address),
          ai_valuations(*)
        `)
        .eq('status', 'listed')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting listed assets:', error);
      return { data: [], error };
    }
  }

  static async getUserAssets(userId: string): Promise<{ data: InsuranceAsset[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('insurance_assets')
        .select(`
          *,
          ai_valuations(*)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      
      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting user assets:', error);
      return { data: [], error };
    }
  }

  static async updateAsset(assetId: string, updates: Partial<InsuranceAsset>): Promise<{ data: InsuranceAsset | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('insurance_assets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', assetId)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error updating asset:', error);
      return { data: null, error };
    }
  }

  static async incrementViewCount(assetId: string): Promise<void> {
    try {
      const { data: asset } = await supabase
        .from('insurance_assets')
        .select('view_count')
        .eq('id', assetId)
        .single();

      if (asset) {
        await supabase
          .from('insurance_assets')
          .update({ 
            view_count: (asset.view_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', assetId);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  // ===== AI VALUATION OPERATIONS =====

  static async saveAIValuation(valuationData: Partial<AIValuation>): Promise<{ data: AIValuation | null; error: any }> {
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

  static async getLatestValuation(assetId: string): Promise<{ data: AIValuation | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('ai_valuations')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error getting latest valuation:', error);
      return { data: null, error };
    }
  }

  // ===== TRANSACTION OPERATIONS =====

  static async createTransaction(transactionData: Partial<Transaction>): Promise<{ data: Transaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          status: transactionData.status || 'pending',
          blockchain_network: transactionData.blockchain_network || 'BSC Testnet',
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

  static async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<{ data: Transaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error updating transaction:', error);
      return { data: null, error };
    }
  }

  static async getTransactionByHash(txHash: string): Promise<{ data: Transaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('blockchain_tx_hash', txHash)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error getting transaction by hash:', error);
      return { data: null, error };
    }
  }

  static async getUserTransactions(userId: string): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          asset:insurance_assets(*),
          seller:users(id, full_name, wallet_address),
          buyer:users(id, full_name, wallet_address)
        `)
        .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return { data: [], error };
    }
  }

  // ===== PLATFORM STATISTICS =====

  static async getPlatformStats(): Promise<{ data: PlatformStats | null; error: any }> {
    try {
      // 실제 데이터 집계
      const [usersCount, assetsCount, transactionsData, activeListings] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('insurance_assets').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount_usd, status').eq('status', 'completed'),
        supabase.from('insurance_assets').select('id', { count: 'exact', head: true }).eq('status', 'listed')
      ]);

      const totalVolume = transactionsData.data?.reduce((sum, tx) => sum + (tx.amount_usd || 0), 0) || 0;
      const completedTransactions = transactionsData.data?.length || 0;

      // 전체 거래 수 (완료 + 취소)
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .in('status', ['completed', 'cancelled']);

      const successRate = totalTransactions > 0 
        ? Math.round((completedTransactions / totalTransactions) * 100 * 100) / 100 
        : 0;

      const stats: PlatformStats = {
        total_users: usersCount.count || 0,
        total_assets: assetsCount.count || 0,
        total_transactions: completedTransactions,
        total_volume_usd: totalVolume,
        active_listings: activeListings.count || 0,
        success_rate: successRate
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      return { data: null, error };
    }
  }

  // ===== 보험회사 목록 (하드코딩에서 동적으로) =====
  static async getInsuranceCompanies(): Promise<{ data: string[]; error: any }> {
    try {
      // hk_top_insurers 테이블에서 조회하거나, 기본 목록 반환
      const { data, error } = await supabase
        .from('hk_top_insurers')
        .select('company_name')
        .order('company_name');

      if (data && data.length > 0) {
        return { data: data.map(item => item.company_name), error: null };
      }

      // 기본 목록 반환 (기존 하드코딩된 목록)
      const defaultCompanies = [
        'AIA Group Limited', 'Prudential plc', 'Manulife Financial', 'Sun Life Financial',
        'Great Eastern Holdings', 'FWD Group', 'Zurich Insurance Group', 'AXA',
        'Generali', 'Allianz', 'MetLife', 'New York Life', 'Pacific Century Group',
        'BOC Life', 'China Life Insurance', 'CNOOC', 'CMB Wing Lung Bank',
        'Standard Chartered', 'HSBC Life', 'Hang Seng Bank', 'Bank of East Asia',
        'DBS Bank', 'OCBC Bank', 'UOB', 'Citibank', 'BNP Paribas',
        'Societe Generale', 'Credit Suisse', 'UBS', 'Morgan Stanley'
      ];

      return { data: defaultCompanies, error: null };
    } catch (error) {
      console.error('Error getting insurance companies:', error);
      return { data: [], error };
    }
  }

  // ===== SEARCH AND FILTER =====
  static async searchAssets(searchTerm: string, filters: any = {}): Promise<{ data: any[]; error: any }> {
    try {
      let query = supabase
        .from('insurance_assets')
        .select(`
          *,
          owner:users(id, full_name, reputation_score, total_trades, wallet_address),
          ai_valuations(*)
        `)
        .eq('status', 'listed');

      // Add search term
      if (searchTerm) {
        query = query.or(`product_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`);
      }

      // Add filters
      if (filters.category) {
        query = query.eq('product_category', filters.category);
      }
      
      if (filters.minPrice) {
        query = query.gte('asking_price', filters.minPrice);
      }
      
      if (filters.maxPrice) {
        query = query.lte('asking_price', filters.maxPrice);
      }

      if (filters.company) {
        query = query.eq('company_name', filters.company);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);
      
      return { data: data || [], error };
    } catch (error) {
      console.error('Error searching assets:', error);
      return { data: [], error };
    }
  }
}

// Utility functions
export const handleDatabaseError = (error: any, context: string = '') => {
  console.error(`Database error ${context}:`, error);
  
  if (error?.code === 'PGRST116') {
    return 'No data found';
  }
  
  if (error?.code === '23505') {
    return 'This record already exists';
  }
  
  if (error?.code === '23503') {
    return 'Referenced record not found';
  }
  
  return error?.message || 'An unexpected error occurred';
};

// 관리자 지갑 주소 확인 (하드코딩 대신 데이터베이스에서)
export const ADMIN_WALLETS = [
  '0x02756b93394d0bD27aE81C1E5a6e1d55D0B608FE' // 기존 관리자 지갑
];

export const isAdminWallet = (walletAddress: string): boolean => {
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase());
};