import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 간단한 Supabase 쿼리로 연결 유지 (올바른 문법)
    const { count, error } = await supabase
      .from('insurance_listings')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('Keep-alive query error:', error);
    }

    return NextResponse.json({ 
      status: 'alive', 
      timestamp: new Date().toISOString(),
      query_result: count !== null ? 'success' : 'no_data',
      count: count
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json({ 
      status: 'error', 
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}