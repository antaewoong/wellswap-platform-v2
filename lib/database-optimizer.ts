'use client';

// Database Performance Optimization System
// Inspired by enterprise-grade optimization patterns

import { createClient } from '@supabase/supabase-js';

// Connection pooling and caching layer
class DatabaseOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private queryQueue = new Map<string, Promise<any>>();
  private connectionPool: ReturnType<typeof createClient>[] = [];
  private currentConnectionIndex = 0;

  constructor(private config: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    maxConnections?: number;
    defaultTTL?: number;
  }) {
    const maxConnections = config.maxConnections || 3;
    
    // Initialize connection pool
    for (let i = 0; i < maxConnections; i++) {
      this.connectionPool.push(
        createClient(config.supabaseUrl, config.supabaseAnonKey, {
          auth: { persistSession: false },
          db: {
            schema: 'public'
          },
          global: {
            headers: {
              'x-connection-id': `pool-${i}`
            }
          }
        })
      );
    }
  }

  // Get next available connection using round-robin
  private getConnection() {
    const connection = this.connectionPool[this.currentConnectionIndex];
    this.currentConnectionIndex = (this.currentConnectionIndex + 1) % this.connectionPool.length;
    return connection;
  }

  // Generate cache key from query parameters
  private getCacheKey(table: string, query: any): string {
    return `${table}_${JSON.stringify(query)}`;
  }

  // Check if cached data is still valid
  private isCacheValid(cacheEntry: { timestamp: number; ttl: number }): boolean {
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }

  // Optimized query with caching and deduplication
  async query<T>(
    table: string,
    queryBuilder: (client: ReturnType<typeof createClient>) => any,
    options: {
      cache?: boolean;
      ttl?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<T> {
    const { cache = true, ttl = this.config.defaultTTL || 300000, skipCache = false } = options;
    
    const cacheKey = this.getCacheKey(table, queryBuilder.toString());

    // Check cache first
    if (cache && !skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        console.log(`📊 Cache hit for ${table}`);
        return cached.data;
      }
    }

    // Check if same query is already in progress (deduplication)
    if (this.queryQueue.has(cacheKey)) {
      console.log(`🔄 Deduplicating query for ${table}`);
      return this.queryQueue.get(cacheKey)!;
    }

    // Execute query
    const queryPromise = this.executeQuery<T>(table, queryBuilder, cacheKey, ttl, cache);
    this.queryQueue.set(cacheKey, queryPromise);

    try {
      const result = await queryPromise;
      return result;
    } finally {
      this.queryQueue.delete(cacheKey);
    }
  }

  private async executeQuery<T>(
    table: string,
    queryBuilder: (client: ReturnType<typeof createClient>) => any,
    cacheKey: string,
    ttl: number,
    shouldCache: boolean
  ): Promise<T> {
    const client = this.getConnection();
    const startTime = performance.now();

    try {
      console.log(`📈 Executing query on ${table}`);
      const query = queryBuilder(client);
      const { data, error } = await query;

      if (error) {
        console.error(`❌ Query error on ${table}:`, error);
        throw error;
      }

      const executionTime = performance.now() - startTime;
      console.log(`✅ Query completed on ${table} in ${executionTime.toFixed(2)}ms`);

      // Cache successful result
      if (shouldCache && data) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl
        });
      }

      return data;
    } catch (error) {
      console.error(`🚨 Query failed on ${table}:`, error);
      throw error;
    }
  }

  // Batch operations for better performance
  async batchQuery<T>(
    operations: Array<{
      table: string;
      queryBuilder: (client: ReturnType<typeof createClient>) => any;
      options?: { cache?: boolean; ttl?: number };
    }>
  ): Promise<T[]> {
    console.log(`🔀 Executing ${operations.length} batch operations`);
    
    const promises = operations.map(op => 
      this.query(op.table, op.queryBuilder, op.options || {})
    );

    return Promise.all(promises);
  }

  // Clear cache for specific patterns
  clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      console.log('🧹 Cleared entire cache');
      return;
    }

    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🧹 Cleared ${keysToDelete.length} cache entries matching "${pattern}"`);
  }

  // Get cache statistics
  getCacheStats() {
    const totalEntries = this.cache.size;
    const validEntries = Array.from(this.cache.values()).filter(entry => 
      this.isCacheValid(entry)
    ).length;

    return {
      totalEntries,
      validEntries,
      hitRate: validEntries / totalEntries || 0,
      memoryUsage: this.cache.size * 1024 // Rough estimate
    };
  }
}

// Optimized query builders for common operations
export class InsuranceQueryOptimizer {
  constructor(private db: DatabaseOptimizer) {}

  // Get insurance listings with intelligent pagination
  async getInsuranceListings(params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const { page = 1, limit = 20, category, status, sortBy = 'created_at', sortOrder = 'desc' } = params;
    const offset = (page - 1) * limit;

    return this.db.query(
      'insurance_listings',
      (client) => {
        let query = client
          .from('insurance_listings')
          .select(`
            id, company, type, premium, coverage, risk_grade, status, 
            blockchain_verified, valuation, roi, created_at,
            annual_premium, contract_period, max_age, min_coverage, location
          `)
          .order(sortBy, { ascending: sortOrder === 'asc' })
          .range(offset, offset + limit - 1);

        if (category) {
          query = query.eq('type', category);
        }

        if (status) {
          query = query.eq('status', status);
        }

        return query;
      },
      { cache: true, ttl: 60000 } // Cache for 1 minute
    );
  }

  // Get insurance listing by ID with related data
  async getInsuranceListingById(id: string) {
    return this.db.query(
      `insurance_listing_${id}`,
      (client) => client
        .from('insurance_listings')
        .select(`
          *, 
          company_details:insurance_companies(name, logo_url, rating),
          similar_listings:insurance_listings!similar_type(id, company, premium, coverage)
        `)
        .eq('id', id)
        .single(),
      { cache: true, ttl: 300000 } // Cache for 5 minutes
    );
  }

  // Get dashboard statistics with aggregation
  async getDashboardStats() {
    return this.db.batchQuery([
      {
        table: 'stats_total_listings',
        queryBuilder: (client) => client
          .from('insurance_listings')
          .select('*', { count: 'exact', head: true }),
        options: { cache: true, ttl: 600000 } // Cache for 10 minutes
      },
      {
        table: 'stats_available_listings',
        queryBuilder: (client) => client
          .from('insurance_listings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available'),
        options: { cache: true, ttl: 300000 }
      },
      {
        table: 'stats_total_value',
        queryBuilder: (client) => client
          .from('insurance_listings')
          .select('valuation.sum()')
          .eq('status', 'available'),
        options: { cache: true, ttl: 600000 }
      },
      {
        table: 'stats_average_roi',
        queryBuilder: (client) => client
          .from('insurance_listings')
          .select('roi.avg()')
          .eq('status', 'available'),
        options: { cache: true, ttl: 600000 }
      }
    ]);
  }

  // Search insurance listings with full-text search
  async searchInsuranceListings(searchTerm: string, filters: any = {}) {
    return this.db.query(
      `search_${searchTerm}_${JSON.stringify(filters)}`,
      (client) => {
        let query = client
          .from('insurance_listings')
          .select('*')
          .or(`company.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`)
          .limit(20);

        if (filters.minPremium) {
          query = query.gte('premium', filters.minPremium);
        }
        
        if (filters.maxPremium) {
          query = query.lte('premium', filters.maxPremium);
        }

        if (filters.riskGrade) {
          query = query.eq('risk_grade', filters.riskGrade);
        }

        return query;
      },
      { cache: true, ttl: 180000 } // Cache for 3 minutes
    );
  }

  // Get inquiry statistics for admin dashboard
  async getInquiryStats() {
    return this.db.query(
      'inquiry_stats',
      (client) => client
        .from('inquiries')
        .select(`
          status,
          created_at,
          consultation_type,
          source
        `)
        .order('created_at', { ascending: false })
        .limit(100),
      { cache: true, ttl: 120000 } // Cache for 2 minutes
    );
  }
}

// Initialize singleton instance
let optimizerInstance: DatabaseOptimizer | null = null;

export const getDbOptimizer = () => {
  if (!optimizerInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase credentials not found, using fallback');
      return null;
    }

    optimizerInstance = new DatabaseOptimizer({
      supabaseUrl,
      supabaseAnonKey,
      maxConnections: 3,
      defaultTTL: 300000
    });
  }

  return optimizerInstance;
};

// React hook for database operations
export const useOptimizedQuery = () => {
  const db = getDbOptimizer();
  
  return {
    db: db ? new InsuranceQueryOptimizer(db) : null,
    clearCache: (pattern?: string) => db?.clearCache(pattern),
    getCacheStats: () => db?.getCacheStats() || null
  };
};

export default {
  DatabaseOptimizer,
  InsuranceQueryOptimizer,
  getDbOptimizer,
  useOptimizedQuery
};