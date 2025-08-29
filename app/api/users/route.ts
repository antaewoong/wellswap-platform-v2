import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 관리자 지갑 주소 (하드코딩)
const ADMIN_WALLETS = [
  '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0',
  // 추가 관리자 지갑 주소를 여기에 추가
];

// 환경변수 체크
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
}

// Supabase 클라이언트 생성 (익명 키 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 관리자 권한 확인 함수
function isAdmin(walletAddress: string): boolean {
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase());
}

// GET: 사용자 정보 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet_address');
    
    if (!walletAddress) {
      return NextResponse.json({ error: '지갑 주소가 필요합니다' }, { status: 400 });
    }

    console.log('🔍 사용자 조회:', walletAddress);

    // 사용자 정보 조회
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('사용자 조회 오류:', error);
      return NextResponse.json({ error: '사용자 조회 실패' }, { status: 500 });
    }

    // 관리자 권한 확인
    const adminStatus = isAdmin(walletAddress);
    
    return NextResponse.json({
      user: user || null,
      isAdmin: adminStatus,
      walletAddress: walletAddress.toLowerCase()
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST: 사용자 생성/업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, ...userData } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: '지갑 주소가 필요합니다' }, { status: 400 });
    }

    console.log('📝 사용자 생성/업데이트:', walletAddress);

    // 관리자 권한 확인
    const adminStatus = isAdmin(walletAddress);

    // 사용자 데이터 준비 (실제 테이블 스키마에 맞춤)
    const userPayload = {
      wallet_address: walletAddress.toLowerCase(),
      role: adminStatus ? 'admin' : 'user',
      is_admin: adminStatus,
      profile_completed: false,
      full_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Upsert로 사용자 생성/업데이트
    const { data: user, error } = await supabase
      .from('users')
      .upsert([userPayload], {
        onConflict: 'wallet_address',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('사용자 생성/업데이트 오류:', error);
      return NextResponse.json({ error: '사용자 처리 실패' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user,
      isAdmin: adminStatus
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
