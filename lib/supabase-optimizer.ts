// 🚀 Supabase Performance Optimization System

import { getSupabase } from './database-wellswap';

const supabase = getSupabase();

// Database indexing optimization queries
export const SUPABASE_INDEXES = {
  // Insurance listings performance indexes
  INSURANCE_LISTINGS_COMPOUND: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_listings_compound
    ON insurance_listings (company, product_category, contract_date DESC, status);
  `,
  
  INSURANCE_LISTINGS_SEARCH: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_listings_search
    ON insurance_listings USING gin(to_tsvector('english', company || ' ' || product_name || ' ' || product_category));
  `,
  
  INSURANCE_LISTINGS_STATUS_DATE: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insurance_listings_status_date
    ON insurance_listings (status, created_at DESC);
  `,

  // User performance indexes
  USERS_WALLET_ADDRESS: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_wallet_address
    ON users (wallet_address) WHERE wallet_address IS NOT NULL;
  `,

  // Trading performance indexes
  TRADES_COMPOUND: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_compound
    ON trades (buyer_id, seller_id, status, created_at DESC);
  `,

  // OCR results performance
  OCR_RESULTS_LISTING: `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ocr_results_listing
    ON ocr_results (listing_id, created_at DESC);
  `,
};

// Query optimization functions
export class SupabaseOptimizer {
  
  // Create all performance indexes
  static async createIndexes() {
    console.log('🔧 Creating Supabase performance indexes...');
    
    const results = [];
    
    for (const [indexName, query] of Object.entries(SUPABASE_INDEXES)) {
      try {
        const { data, error } = await supabase.rpc('execute_sql', { sql: query });
        
        if (error) {
          console.error(`❌ Failed to create index ${indexName}:`, error);
          results.push({ index: indexName, success: false, error: error.message });
        } else {
          console.log(`✅ Created index ${indexName}`);
          results.push({ index: indexName, success: true });
        }
      } catch (error) {
        console.error(`❌ Error creating index ${indexName}:`, error);
        results.push({ index: indexName, success: false, error: String(error) });
      }
    }
    
    return results;
  }

  // Analyze query performance
  static async analyzeQueryPerformance() {
    console.log('🔍 Analyzing Supabase query performance...');
    
    const queries = [
      // Most common listing queries
      {
        name: 'listings_by_company',
        query: supabase
          .from('insurance_listings')
          .select('*')
          .eq('company', 'Samsung Life')
          .order('created_at', { ascending: false })
          .limit(10)
      },
      
      {
        name: 'listings_by_category',
        query: supabase
          .from('insurance_listings')
          .select('*')
          .eq('product_category', 'Life Insurance')
          .order('contract_date', { ascending: false })
          .limit(10)
      },
      
      {
        name: 'active_listings',
        query: supabase
          .from('insurance_listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(20)
      },

      {
        name: 'user_listings',
        query: supabase
          .from('insurance_listings')
          .select('*')
          .eq('user_id', 1) // Example user ID
          .order('created_at', { ascending: false })
      }
    ];

    const results = [];
    
    for (const { name, query } of queries) {
      const startTime = performance.now();
      
      try {
        const { data, error } = await query;
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (error) {
          results.push({ 
            query: name, 
            success: false, 
            error: error.message,
            duration: duration 
          });
        } else {
          results.push({ 
            query: name, 
            success: true, 
            duration: duration,
            resultCount: data?.length || 0
          });
        }
      } catch (error) {
        const endTime = performance.now();
        results.push({ 
          query: name, 
          success: false, 
          error: String(error),
          duration: endTime - startTime 
        });
      }
    }
    
    return results;
  }

  // Optimized listing queries
  static async getOptimizedListings({
    company,
    category,
    status = 'active',
    limit = 20,
    offset = 0
  }) {
    let query = supabase
      .from('insurance_listings')
      .select(`
        id,
        company,
        product_name,
        product_category,
        contract_date,
        status,
        selling_price,
        created_at,
        users!inner(wallet_address)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (company) {
      query = query.eq('company', company);
    }
    
    if (category) {
      query = query.eq('product_category', category);
    }

    return query;
  }

  // Full-text search optimization
  static async searchListings(searchTerm: string, limit = 10) {
    return supabase
      .from('insurance_listings')
      .select(`
        id,
        company,
        product_name,
        product_category,
        selling_price,
        created_at
      `)
      .textSearch('search_vector', searchTerm)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  // Database cleanup and maintenance
  static async performMaintenance() {
    console.log('🧹 Performing Supabase maintenance...');
    
    const tasks = [
      // Clean up old OCR results (older than 30 days)
      supabase
        .from('ocr_results')
        .delete()
        .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Clean up expired listings (older than 90 days and inactive)
      supabase
        .from('insurance_listings')
        .delete()
        .eq('status', 'expired')
        .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
    ];

    const results = [];
    
    for (const task of tasks) {
      try {
        const { data, error } = await task;
        if (error) {
          results.push({ success: false, error: error.message });
        } else {
          results.push({ success: true, affected: data?.length || 0 });
        }
      } catch (error) {
        results.push({ success: false, error: String(error) });
      }
    }

    return results;
  }

  // Get database statistics
  static async getDatabaseStats() {
    const stats = {
      listings: { total: 0, active: 0, expired: 0 },
      users: { total: 0, with_wallets: 0 },
      trades: { total: 0, completed: 0, pending: 0 },
      ocr_results: { total: 0 }
    };

    try {
      // Listings stats
      const { data: listingsStats } = await supabase
        .from('insurance_listings')
        .select('status')
        .then(async ({ data }) => {
          if (data) {
            stats.listings.total = data.length;
            stats.listings.active = data.filter(l => l.status === 'active').length;
            stats.listings.expired = data.filter(l => l.status === 'expired').length;
          }
          return { data };
        });

      // Users stats
      const { data: usersStats } = await supabase
        .from('users')
        .select('wallet_address')
        .then(async ({ data }) => {
          if (data) {
            stats.users.total = data.length;
            stats.users.with_wallets = data.filter(u => u.wallet_address).length;
          }
          return { data };
        });

      // Trades stats (if table exists)
      try {
        const { data: tradesStats } = await supabase
          .from('trades')
          .select('status')
          .then(async ({ data }) => {
            if (data) {
              stats.trades.total = data.length;
              stats.trades.completed = data.filter(t => t.status === 'completed').length;
              stats.trades.pending = data.filter(t => t.status === 'pending').length;
            }
            return { data };
          });
      } catch {
        // Trades table might not exist
        stats.trades = { total: 0, completed: 0, pending: 0, note: 'table_not_found' };
      }

      // OCR results stats
      const { data: ocrStats } = await supabase
        .from('ocr_results')
        .select('id', { count: 'exact', head: true });
        
      stats.ocr_results.total = ocrStats?.length || 0;

    } catch (error) {
      console.error('Error getting database stats:', error);
    }

    return stats;
  }
}

// Auto-optimization scheduler
export class AutoOptimizer {
  private static interval: NodeJS.Timeout | null = null;

  // Start automatic optimization (runs every 6 hours)
  static startAutoOptimization() {
    if (this.interval) return;

    console.log('⚡ Starting auto-optimization scheduler...');
    
    // Run immediately
    this.runOptimization();
    
    // Run every 6 hours
    this.interval = setInterval(() => {
      this.runOptimization();
    }, 6 * 60 * 60 * 1000);
  }

  // Stop automatic optimization
  static stopAutoOptimization() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏹️ Auto-optimization stopped');
    }
  }

  // Run optimization tasks
  private static async runOptimization() {
    console.log('🚀 Running automatic database optimization...');
    
    try {
      // Analyze performance
      const performanceResults = await SupabaseOptimizer.analyzeQueryPerformance();
      console.log('📊 Performance analysis:', performanceResults);
      
      // Perform maintenance
      const maintenanceResults = await SupabaseOptimizer.performMaintenance();
      console.log('🧹 Maintenance results:', maintenanceResults);
      
      // Get updated stats
      const stats = await SupabaseOptimizer.getDatabaseStats();
      console.log('📈 Database stats:', stats);
      
    } catch (error) {
      console.error('❌ Auto-optimization failed:', error);
    }
  }
}

export default SupabaseOptimizer;