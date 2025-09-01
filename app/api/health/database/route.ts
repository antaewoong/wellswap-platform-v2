import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/database-wellswap';

export async function GET() {
  try {
    // Simple query to test database connection
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: 'disconnected',
          error: 'Supabase client not available in server environment',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('insurance_listings')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      queryTime: 'success'
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown database error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}