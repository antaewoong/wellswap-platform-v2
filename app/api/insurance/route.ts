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

// GET: 보험 자산 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet_address');
    const status = searchParams.get('status');
    
    console.log('🔍 보험 자산 조회:', { walletAddress, status });

    let query = supabase
      .from('wellswaphk_insurance_policies')
      .select('*');

    // 관리자가 아닌 경우 자신의 자산만 조회
    if (walletAddress && !isAdmin(walletAddress)) {
      query = query.eq('seller_address', walletAddress.toLowerCase());
    }

    // 상태 필터 적용
    if (status) {
      query = query.eq('status', status);
    }

    const { data: assets, error } = await query;

    if (error) {
      console.error('보험 자산 조회 오류:', error);
      return NextResponse.json({ error: '보험 자산 조회 실패' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      assets: assets || [],
      isAdmin: walletAddress ? isAdmin(walletAddress) : false
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// POST: 보험 자산 생성/업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, ...assetData } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: '지갑 주소가 필요합니다' }, { status: 400 });
    }

    console.log('📝 보험 자산 생성/업데이트:', { walletAddress, assetData });

    // 보험 자산 데이터 준비
    const assetPayload = {
      ...assetData,
      seller_address: walletAddress.toLowerCase(),
      status: assetData.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Upsert로 보험 자산 생성/업데이트
    const { data: asset, error } = await supabase
      .from('wellswaphk_insurance_policies')
      .upsert([assetPayload], {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('보험 자산 생성/업데이트 오류:', error);
      return NextResponse.json({ error: '보험 자산 처리 실패' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      asset
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// PATCH: 보험 자산 상태 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, walletAddress, ...updateData } = body;

    if (!id || !walletAddress) {
      return NextResponse.json({ error: 'ID와 지갑 주소가 필요합니다' }, { status: 400 });
    }

    console.log('🔄 보험 자산 상태 업데이트:', { id, status, walletAddress });

    // 관리자 권한 확인
    if (!isAdmin(walletAddress)) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    // 보험 자산 업데이트
    const { data: asset, error } = await supabase
      .from('wellswaphk_insurance_policies')
      .update({
        ...updateData,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('보험 자산 업데이트 오류:', error);
      return NextResponse.json({ error: '보험 자산 업데이트 실패' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      asset
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

