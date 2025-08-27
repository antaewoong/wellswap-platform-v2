// lib/database.types.ts - Complete Database Type Definitions
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          wallet_address: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          country: string
          language: string
          created_at: string
          updated_at: string
          is_verified: boolean
          kyc_status: 'pending' | 'verified' | 'rejected'
          total_trades: number
          total_volume: number
          reputation_score: number
        }
        Insert: {
          id: string
          wallet_address?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          country?: string
          language?: string
          is_verified?: boolean
          kyc_status?: 'pending' | 'verified' | 'rejected'
          total_trades?: number
          total_volume?: number
          reputation_score?: number
        }
        Update: {
          wallet_address?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          country?: string
          language?: string
          is_verified?: boolean
          kyc_status?: 'pending' | 'verified' | 'rejected'
          total_trades?: number
          total_volume?: number
          reputation_score?: number
        }
      }
      insurance_companies: {
        Row: {
          id: number
          name: string
          country: string
          license_number: string | null
          rating: number
          is_verified: boolean
          logo_url: string | null
          website: string | null
          created_at: string
        }
        Insert: {
          name: string
          country: string
          license_number?: string | null
          rating?: number
          is_verified?: boolean
          logo_url?: string | null
          website?: string | null
        }
        Update: {
          name?: string
          country?: string
          license_number?: string | null
          rating?: number
          is_verified?: boolean
          logo_url?: string | null
          website?: string | null
        }
      }
      insurance_products: {
        Row: {
          id: string
          owner_id: string
          company_id: number | null
          product_name: string
          product_type: string
          policy_number: string | null
          original_value: number
          current_value: number | null
          asking_price: number | null
          currency: string
          risk_level: 'Low' | 'Medium' | 'High' | null
          maturity_date: string | null
          purchase_date: string | null
          location: string | null
          status: 'draft' | 'analyzing' | 'listed' | 'sold' | 'withdrawn'
          created_at: string
          updated_at: string
        }
        Insert: {
          owner_id: string
          company_id?: number | null
          product_name: string
          product_type: string
          policy_number?: string | null
          original_value: number
          current_value?: number | null
          asking_price?: number | null
          currency?: string
          risk_level?: 'Low' | 'Medium' | 'High' | null
          maturity_date?: string | null
          purchase_date?: string | null
          location?: string | null
          status?: 'draft' | 'analyzing' | 'listed' | 'sold' | 'withdrawn'
        }
        Update: {
          company_id?: number | null
          product_name?: string
          product_type?: string
          policy_number?: string | null
          original_value?: number
          current_value?: number | null
          asking_price?: number | null
          currency?: string
          risk_level?: 'Low' | 'Medium' | 'High' | null
          maturity_date?: string | null
          purchase_date?: string | null
          location?: string | null
          status?: 'draft' | 'analyzing' | 'listed' | 'sold' | 'withdrawn'
        }
      }
      ai_analysis: {
        Row: {
          id: string
          product_id: string
          surrender_value: number | null
          market_premium: number | null
          time_value: number | null
          company_adjustment: number | null
          risk_assessment: string | null
          confidence_score: number | null
          final_valuation: number | null
          recommended_price: number | null
          analysis_data: any | null
          hong_kong_ia_data: any | null
          created_at: string
        }
        Insert: {
          product_id: string
          surrender_value?: number | null
          market_premium?: number | null
          time_value?: number | null
          company_adjustment?: number | null
          risk_assessment?: string | null
          confidence_score?: number | null
          final_valuation?: number | null
          recommended_price?: number | null
          analysis_data?: any | null
          hong_kong_ia_data?: any | null
        }
        Update: {
          surrender_value?: number | null
          market_premium?: number | null
          time_value?: number | null
          company_adjustment?: number | null
          risk_assessment?: string | null
          confidence_score?: number | null
          final_valuation?: number | null
          recommended_price?: number | null
          analysis_data?: any | null
          hong_kong_ia_data?: any | null
        }
      }
      documents: {
        Row: {
          id: string
          product_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          upload_date: string
          ocr_text: string | null
          is_processed: boolean
        }
        Insert: {
          product_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          ocr_text?: string | null
          is_processed?: boolean
        }
        Update: {
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          ocr_text?: string | null
          is_processed?: boolean
        }
      }
      transactions: {
        Row: {
          id: string
          product_id: string | null
          seller_id: string | null
          buyer_id: string | null
          transaction_hash: string | null
          contract_address: string | null
          price: number
          currency: string
          platform_fee: number | null
          registration_fee: number
          status: 'pending' | 'escrow' | 'completed' | 'cancelled' | 'disputed'
          multisig_signatures: any
          escrow_released: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: {
          product_id?: string | null
          seller_id?: string | null
          buyer_id?: string | null
          transaction_hash?: string | null
          contract_address?: string | null
          price: number
          currency?: string
          platform_fee?: number | null
          registration_fee?: number
          status?: 'pending' | 'escrow' | 'completed' | 'cancelled' | 'disputed'
          multisig_signatures?: any
          escrow_released?: boolean
          completed_at?: string | null
        }
        Update: {
          transaction_hash?: string | null
          contract_address?: string | null
          price?: number
          currency?: string
          platform_fee?: number | null
          registration_fee?: number
          status?: 'pending' | 'escrow' | 'completed' | 'cancelled' | 'disputed'
          multisig_signatures?: any
          escrow_released?: boolean
          completed_at?: string | null
        }
      }
      trade_messages: {
        Row: {
          id: string
          transaction_id: string
          sender_id: string
          message: string
          message_type: 'text' | 'system' | 'file'
          is_read: boolean
          created_at: string
        }
        Insert: {
          transaction_id: string
          sender_id: string
          message: string
          message_type?: 'text' | 'system' | 'file'
          is_read?: boolean
        }
        Update: {
          message?: string
          message_type?: 'text' | 'system' | 'file'
          is_read?: boolean
        }
      }
      platform_settings: {
        Row: {
          id: number
          setting_key: string
          setting_value: string
          description: string | null
          updated_at: string
        }
        Insert: {
          setting_key: string
          setting_value: string
          description?: string | null
        }
        Update: {
          setting_key?: string
          setting_value?: string
          description?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          action_url?: string | null
        }
        Update: {
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          action_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Additional type definitions for better type safety
export type Profile = Database['public']['Tables']['profiles']['Row']
export type InsuranceCompany = Database['public']['Tables']['insurance_companies']['Row']
export type InsuranceProduct = Database['public']['Tables']['insurance_products']['Row']
export type AIAnalysis = Database['public']['Tables']['ai_analysis']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TradeMessage = Database['public']['Tables']['trade_messages']['Row']
export type PlatformSetting = Database['public']['Tables']['platform_settings']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Insert and Update types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type InsuranceProductInsert = Database['public']['Tables']['insurance_products']['Insert']
export type InsuranceProductUpdate = Database['public']['Tables']['insurance_products']['Update']
export type AIAnalysisInsert = Database['public']['Tables']['ai_analysis']['Insert']
export type AIAnalysisUpdate = Database['public']['Tables']['ai_analysis']['Update']

// Enums
export type KYCStatus = 'pending' | 'verified' | 'rejected'
export type ProductStatus = 'draft' | 'analyzing' | 'listed' | 'sold' | 'withdrawn'
export type TransactionStatus = 'pending' | 'escrow' | 'completed' | 'cancelled' | 'disputed'
export type RiskLevel = 'Low' | 'Medium' | 'High'
export type MessageType = 'text' | 'system' | 'file'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

// Extended types with relations
export interface ProductWithAnalysis extends InsuranceProduct {
  ai_analysis?: AIAnalysis[]
  insurance_companies?: InsuranceCompany
  profiles?: {
    full_name: string | null
    reputation_score: number
    total_trades: number
    wallet_address: string | null
  }
  documents?: Document[]
}

export interface TransactionWithDetails extends Transaction {
  product?: InsuranceProduct
  seller?: Profile
  buyer?: Profile
  messages?: TradeMessage[]
}

export interface ProfileWithStats extends Profile {
  products_count?: number
  active_transactions?: number
  completed_transactions?: number
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  message?: string
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Filter types
export interface ProductFilters {
  company?: string
  productType?: string
  minValue?: number
  maxValue?: number
  riskLevel?: RiskLevel
  location?: string
  currency?: string
  status?: ProductStatus
}

export interface TransactionFilters {
  status?: TransactionStatus
  minPrice?: number
  maxPrice?: number
  currency?: string
  dateFrom?: string
  dateTo?: string
}

// Statistics types
export interface PlatformStats {
  totalUsers: number
  totalProducts: number
  totalTransactions: number
  totalVolume: number
  averageRating: number
  topCompanies: Array<{
    name: string
    count: number
    volume: number
  }>
}

export interface UserStats {
  totalProducts: number
  listedProducts: number
  soldProducts: number
  totalVolume: number
  averageRating: number
  completedTransactions: number
}

// Real-time subscription types
export interface RealtimePayload<T = any> {
  schema: string
  table: string
  commit_timestamp: string
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: T
  old?: T
}

// File upload types
export interface FileUploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  folder?: string
  resize?: {
    width: number
    height: number
    quality: number
  }
}

// Error types
export interface DatabaseError {
  message: string
  details: string
  hint: string
  code: string
}

// Utility types
export type TableName = keyof Database['public']['Tables']
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']
