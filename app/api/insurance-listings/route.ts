import { NextRequest, NextResponse } from 'next/server';
import { getDbOptimizer, InsuranceQueryOptimizer } from '../../../lib/database-optimizer';

// Performance monitoring
const performanceTracker = {
  requests: 0,
  totalTime: 0,
  averageTime: 0,
  errors: 0,
  
  track(duration: number, error = false) {
    this.requests++;
    if (error) {
      this.errors++;
    } else {
      this.totalTime += duration;
      this.averageTime = this.totalTime / (this.requests - this.errors);
    }
  },

  getStats() {
    return {
      totalRequests: this.requests,
      totalErrors: this.errors,
      averageResponseTime: this.averageTime.toFixed(2),
      errorRate: (this.errors / this.requests * 100).toFixed(2)
    };
  }
};

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters with validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const search = searchParams.get('search') || undefined;
    
    // Filters
    const minPremium = searchParams.get('minPremium') ? parseInt(searchParams.get('minPremium')!) : undefined;
    const maxPremium = searchParams.get('maxPremium') ? parseInt(searchParams.get('maxPremium')!) : undefined;
    const riskGrade = searchParams.get('riskGrade') || undefined;

    console.log(`📊 API Request: page=${page}, limit=${limit}, category=${category}, status=${status}`);

    const db = getDbOptimizer();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database optimizer not available',
        data: [],
        meta: { total: 0, page, limit, hasNextPage: false }
      }, { status: 503 });
    }

    const queryOptimizer = new InsuranceQueryOptimizer(db);

    let results;
    
    if (search) {
      // Use search functionality
      results = await queryOptimizer.searchInsuranceListings(search, {
        minPremium,
        maxPremium,
        riskGrade
      });
    } else {
      // Use regular listing retrieval
      results = await queryOptimizer.getInsuranceListings({
        page,
        limit,
        category,
        status,
        sortBy,
        sortOrder
      });
    }

    // Calculate metadata for pagination
    const total = Array.isArray(results) ? results.length : 0;
    const hasNextPage = total === limit; // Approximation - in production, you'd want exact counts
    
    const response = {
      success: true,
      data: results || [],
      meta: {
        total,
        page,
        limit,
        hasNextPage,
        totalPages: Math.ceil(total / limit),
        cacheStats: db.getCacheStats()
      },
      performance: {
        responseTime: (performance.now() - startTime).toFixed(2) + 'ms',
        cached: results ? true : false
      }
    };

    performanceTracker.track(performance.now() - startTime);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Response-Time': (performance.now() - startTime).toFixed(2) + 'ms',
        'X-Cache-Hit': results ? 'true' : 'false'
      }
    });

  } catch (error) {
    performanceTracker.track(performance.now() - startTime, true);
    
    console.error('❌ Insurance listings API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch insurance listings',
      data: [],
      meta: { total: 0, page: 1, limit: 20, hasNextPage: false },
      debug: process.env.NODE_ENV === 'development' ? error : undefined
    }, { 
      status: 500,
      headers: {
        'X-Response-Time': (performance.now() - startTime).toFixed(2) + 'ms',
        'X-Error': 'true'
      }
    });
  }
}

// Health check and statistics endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'health') {
      const db = getDbOptimizer();
      
      return NextResponse.json({
        success: true,
        status: 'healthy',
        database: db ? 'connected' : 'unavailable',
        cache: db?.getCacheStats() || null,
        performance: performanceTracker.getStats(),
        timestamp: new Date().toISOString()
      });
    }

    if (body.action === 'clearCache') {
      const db = getDbOptimizer();
      db?.clearCache(body.pattern);
      
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully',
        pattern: body.pattern || 'all'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Insurance listings POST API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Invalid request'
    }, { status: 400 });
  }
}

// Dashboard statistics endpoint
export async function PUT(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const db = getDbOptimizer();
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database optimizer not available'
      }, { status: 503 });
    }

    const queryOptimizer = new InsuranceQueryOptimizer(db);
    const stats = await queryOptimizer.getDashboardStats();

    const response = {
      success: true,
      data: {
        totalListings: Array.isArray(stats) && stats[0] && typeof stats[0] === 'object' && 'count' in stats[0] ? Number(stats[0].count) : 0,
        availableListings: Array.isArray(stats) && stats[1] && typeof stats[1] === 'object' && 'count' in stats[1] ? Number(stats[1].count) : 0,
        totalValue: Array.isArray(stats) && stats[2] && Array.isArray(stats[2]) && stats[2][0] && typeof stats[2][0] === 'object' && 'sum' in stats[2][0] ? Number(stats[2][0].sum) : 0,
        averageROI: Array.isArray(stats) && stats[3] && Array.isArray(stats[3]) && stats[3][0] && typeof stats[3][0] === 'object' && 'avg' in stats[3][0] ? Number(stats[3][0].avg) : 0,
        lastUpdated: new Date().toISOString()
      },
      performance: {
        responseTime: (performance.now() - startTime).toFixed(2) + 'ms'
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Response-Time': (performance.now() - startTime).toFixed(2) + 'ms'
      }
    });

  } catch (error) {
    console.error('❌ Dashboard stats API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    }, { status: 500 });
  }
}