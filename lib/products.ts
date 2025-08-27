// lib/products.ts - Complete Products Management Service
import { supabase, log, WellSwapError, generatePolicyId, PLATFORM_CONFIG } from './supabase'
import { Database } from './database.types'

type InsuranceProduct = Database['public']['Tables']['insurance_products']['Row']
type InsertProduct = Database['public']['Tables']['insurance_products']['Insert']
type UpdateProduct = Database['public']['Tables']['insurance_products']['Update']
type AIAnalysis = Database['public']['Tables']['ai_analysis']['Row']

export interface CreateProductData {
  company_name: string
  product_name: string
  product_type: string
  policy_number?: string
  original_value: number
  currency?: string
  purchase_date?: string
  maturity_date?: string
  premium_amount?: number
  location?: string
  risk_level?: 'Low' | 'Medium' | 'High'
}

export interface ProductWithAnalysis extends InsuranceProduct {
  ai_analysis?: AIAnalysis[]
  insurance_companies?: Database['public']['Tables']['insurance_companies']['Row']
  profiles?: {
    full_name: string | null
    reputation_score: number
    total_trades: number
    wallet_address: string | null
  }
}

export class ProductService {
  // 새 보험 상품 생성
  static async createProduct(productData: CreateProductData): Promise<InsuranceProduct> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new WellSwapError('Authentication required', 'AUTH_REQUIRED')

      // 보험사 ID 찾기 또는 생성
      let companyId: number | null = null
      
      if (productData.company_name) {
        const { data: existingCompany } = await supabase
          .from('insurance_companies')
          .select('id')
          .eq('name', productData.company_name)
          .single()

        if (existingCompany) {
          companyId = (existingCompany as any).id
        } else {
          // 새 보험사 생성
          const { data: newCompany, error: companyError } = await (supabase
            .from('insurance_companies')
            .insert({
              name: productData.company_name,
              country: productData.location || 'Hong Kong',
              is_verified: false
            })
            .select('id')
            .single() as any)

          if (companyError) {
            log.error('Create company error:', companyError)
          } else {
            companyId = newCompany.id
          }
        }
      }

      // 정책 번호 생성 (없는 경우)
      const policyNumber = productData.policy_number || generatePolicyId()

      const insertData: InsertProduct = {
        owner_id: user.id,
        company_id: companyId,
        product_name: productData.product_name,
        product_type: productData.product_type,
        policy_number: policyNumber,
        original_value: productData.original_value,
        currency: productData.currency || 'USD',
        purchase_date: productData.purchase_date || null,
        maturity_date: productData.maturity_date || null,
        location: productData.location || 'Hong Kong',
        risk_level: productData.risk_level || null,
        status: 'draft'
      }

      const { data, error } = await supabase
        .from('insurance_products')
        .insert(insertData)
        .select(`
          *,
          insurance_companies (*)
        `)
        .single()

      if (error) {
        log.error('Create product error:', error)
        throw new WellSwapError(error.message, 'PRODUCT_CREATE_ERROR', error)
      }

      log.info('Product created successfully:', data.id)
      return data as InsuranceProduct
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Product creation failed', 'PRODUCT_CREATE_FAILED', error)
    }
  }

  // 사용자 상품 목록 가져오기
  static async getUserProducts(): Promise<ProductWithAnalysis[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new WellSwapError('Authentication required', 'AUTH_REQUIRED')

      const { data, error } = await supabase
        .from('insurance_products')
        .select(`
          *,
          insurance_companies (*),
          ai_analysis (*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        log.error('Get user products error:', error)
        throw new WellSwapError(error.message, 'PRODUCTS_FETCH_ERROR', error)
      }

      return data as ProductWithAnalysis[]
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Failed to fetch user products', 'PRODUCTS_FETCH_FAILED', error)
    }
  }

  // 마켓플레이스 상품 목록 (공개된 상품만)
  static async getMarketplaceProducts(): Promise<ProductWithAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('insurance_products')
        .select(`
          *,
          insurance_companies (*),
          ai_analysis (*),
          profiles!insurance_products_owner_id_fkey (
            full_name,
            reputation_score,
            total_trades,
            wallet_address
          )
        `)
        .eq('status', 'listed')
        .order('created_at', { ascending: false })

      if (error) {
        log.error('Get marketplace products error:', error)
        throw new WellSwapError(error.message, 'MARKETPLACE_FETCH_ERROR', error)
      }

      return data as ProductWithAnalysis[]
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Failed to fetch marketplace products', 'MARKETPLACE_FETCH_FAILED', error)
    }
  }

  // 특정 상품 상세 정보
  static async getProduct(productId: string): Promise<ProductWithAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('insurance_products')
        .select(`
          *,
          insurance_companies (*),
          ai_analysis (*),
          profiles!insurance_products_owner_id_fkey (
            full_name,
            reputation_score,
            total_trades,
            wallet_address
          )
        `)
        .eq('id', productId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        log.error('Get product error:', error)
        throw new WellSwapError(error.message, 'PRODUCT_FETCH_ERROR', error)
      }

      return data as ProductWithAnalysis
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Failed to fetch product', 'PRODUCT_FETCH_FAILED', error)
    }
  }

  // 상품 정보 업데이트
  static async updateProduct(productId: string, updates: UpdateProduct): Promise<InsuranceProduct> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new WellSwapError('Authentication required', 'AUTH_REQUIRED')

      // 소유권 확인
      const product = await this.getProduct(productId)
      if (!product) throw new WellSwapError('Product not found', 'PRODUCT_NOT_FOUND')
      if (product.owner_id !== user.id) throw new WellSwapError('Access denied', 'ACCESS_DENIED')

      const { data, error } = await supabase
        .from('insurance_products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        log.error('Update product error:', error)
        throw new WellSwapError(error.message, 'PRODUCT_UPDATE_ERROR', error)
      }

      log.info('Product updated successfully:', productId)
      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Product update failed', 'PRODUCT_UPDATE_FAILED', error)
    }
  }

  // 상품 삭제
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new WellSwapError('Authentication required', 'AUTH_REQUIRED')

      // 소유권 확인
      const product = await this.getProduct(productId)
      if (!product) throw new WellSwapError('Product not found', 'PRODUCT_NOT_FOUND')
      if (product.owner_id !== user.id) throw new WellSwapError('Access denied', 'ACCESS_DENIED')

      // 거래 중인 상품은 삭제 불가
      if (product.status === 'listed') {
        throw new WellSwapError('Cannot delete listed product', 'PRODUCT_LISTED')
      }

      const { error } = await supabase
        .from('insurance_products')
        .delete()
        .eq('id', productId)

      if (error) {
        log.error('Delete product error:', error)
        throw new WellSwapError(error.message, 'PRODUCT_DELETE_ERROR', error)
      }

      log.info('Product deleted successfully:', productId)
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Product deletion failed', 'PRODUCT_DELETE_FAILED', error)
    }
  }

  // AI 분석 결과 저장
  static async saveAIAnalysis(productId: string, analysisData: {
    surrenderValue?: number
    marketPremium?: number
    timeValue?: number
    companyAdjustment?: number
    riskAssessment?: string
    confidenceScore?: number
    finalValuation?: number
    recommendedPrice?: number
    analysisData?: any
    hongKongIAData?: any
  }): Promise<AIAnalysis> {
    try {
      const { data, error } = await supabase
        .from('ai_analysis')
        .insert({
          product_id: productId,
          surrender_value: analysisData.surrenderValue,
          market_premium: analysisData.marketPremium,
          time_value: analysisData.timeValue,
          company_adjustment: analysisData.companyAdjustment,
          risk_assessment: analysisData.riskAssessment,
          confidence_score: analysisData.confidenceScore,
          final_valuation: analysisData.finalValuation,
          recommended_price: analysisData.recommendedPrice,
          analysis_data: analysisData.analysisData,
          hong_kong_ia_data: analysisData.hongKongIAData
        })
        .select()
        .single()

      if (error) {
        log.error('Save AI analysis error:', error)
        throw new WellSwapError(error.message, 'AI_ANALYSIS_SAVE_ERROR', error)
      }

      // 분석 완료 후 상품 상태 업데이트
      if (analysisData.confidenceScore && analysisData.confidenceScore >= PLATFORM_CONFIG.AI_CONFIDENCE_THRESHOLD) {
        await this.updateProduct(productId, { 
          status: 'listed',
          current_value: analysisData.finalValuation,
          asking_price: analysisData.recommendedPrice
        })
      }

      log.info('AI analysis saved successfully:', productId)
      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('AI analysis save failed', 'AI_ANALYSIS_SAVE_FAILED', error)
    }
  }

  // 상품 검색 (필터링)
  static async searchProducts(filters: {
    company?: string
    productType?: string
    minValue?: number
    maxValue?: number
    riskLevel?: string
    location?: string
    currency?: string
  }): Promise<ProductWithAnalysis[]> {
    try {
      let query = supabase
        .from('insurance_products')
        .select(`
          *,
          insurance_companies (*),
          ai_analysis (*),
          profiles!insurance_products_owner_id_fkey (
            full_name,
            reputation_score,
            total_trades,
            wallet_address
          )
        `)
        .eq('status', 'listed')

      if (filters.company) {
        query = query.ilike('insurance_companies.name', `%${filters.company}%`)
      }

      if (filters.productType) {
        query = query.eq('product_type', filters.productType)
      }

      if (filters.minValue) {
        query = query.gte('current_value', filters.minValue)
      }

      if (filters.maxValue) {
        query = query.lte('current_value', filters.maxValue)
      }

      if (filters.riskLevel) {
        query = query.eq('risk_level', filters.riskLevel)
      }

      if (filters.location) {
        query = query.eq('location', filters.location)
      }

      if (filters.currency) {
        query = query.eq('currency', filters.currency)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        log.error('Search products error:', error)
        throw new WellSwapError(error.message, 'PRODUCT_SEARCH_ERROR', error)
      }

      return data as ProductWithAnalysis[]
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Product search failed', 'PRODUCT_SEARCH_FAILED', error)
    }
  }

  // 인기 상품 가져오기
  static async getTrendingProducts(limit: number = 10): Promise<ProductWithAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('insurance_products')
        .select(`
          *,
          insurance_companies (*),
          ai_analysis (*)
        `)
        .eq('status', 'listed')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        log.error('Get trending products error:', error)
        throw new WellSwapError(error.message, 'TRENDING_FETCH_ERROR', error)
      }

      return data as ProductWithAnalysis[]
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Failed to fetch trending products', 'TRENDING_FETCH_FAILED', error)
    }
  }

  // 보험사 목록 가져오기
  static async getInsuranceCompanies(): Promise<Database['public']['Tables']['insurance_companies']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('*')
        .order('name')

      if (error) {
        log.error('Get insurance companies error:', error)
        throw new WellSwapError(error.message, 'COMPANIES_FETCH_ERROR', error)
      }

      return data
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Failed to fetch insurance companies', 'COMPANIES_FETCH_FAILED', error)
    }
  }

  // 상품 통계
  static async getProductStats(): Promise<{
    totalProducts: number
    totalValue: number
    avgConfidence: number
    topCompanies: Array<{name: string, count: number}>
  }> {
    try {
      // 총 상품 수와 가치
      const { data: statsData, error: statsError } = await supabase
        .from('insurance_products')
        .select('original_value, current_value')
        .eq('status', 'listed')

      if (statsError) {
        log.error('Get product stats error:', statsError)
        throw new WellSwapError(statsError.message, 'STATS_FETCH_ERROR', statsError)
      }

      // AI 분석 평균 신뢰도
      const { data: aiData, error: aiError } = await supabase
        .from('ai_analysis')
        .select('confidence_score')

      if (aiError) {
        log.error('Get AI stats error:', aiError)
      }

      // 상위 보험사
      const { data: companiesData, error: companiesError } = await supabase
        .from('insurance_products')
        .select(`
          insurance_companies!inner(name)
        `)
        .eq('status', 'listed')

      if (companiesError) {
        log.error('Get companies stats error:', companiesError)
      }

      const totalProducts = statsData?.length || 0
      const totalValue = statsData?.reduce((sum, product) => sum + (product.current_value || product.original_value), 0) || 0
      const avgConfidence = aiData && aiData.length > 0 
        ? aiData.reduce((sum, analysis) => sum + (analysis.confidence_score || 0), 0) / aiData.length 
        : 0

      // 보험사별 상품 수 계산
      const companyCount: Record<string, number> = {}
      companiesData?.forEach((item: any) => {
        const companyName = item.insurance_companies?.name
        if (companyName) {
          companyCount[companyName] = (companyCount[companyName] || 0) + 1
        }
      })

      const topCompanies = Object.entries(companyCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return {
        totalProducts,
        totalValue,
        avgConfidence,
        topCompanies
      }
    } catch (error) {
      if (error instanceof WellSwapError) throw error
      throw new WellSwapError('Failed to fetch product statistics', 'STATS_FETCH_FAILED', error)
    }
  }
}
