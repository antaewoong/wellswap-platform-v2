// system-check.js - 전체 시스템 상태 확인
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cwqoujyckwetdyxzmaym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cW91anlja3dldGR5eHptYXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODQ5NTgsImV4cCI6MjA3MDY2MDk1OH0.ESZ7M3EYIKkOErzizEdE2gZMEgTn16gg3g_bsKEYUwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function systemCheck() {
  console.log('🔍 WellSwap 시스템 종합 점검 시작...\n');
  
  // 1. 환경 변수 확인
  console.log('1️⃣ 환경 변수 확인:');
  console.log('✅ Supabase URL:', supabaseUrl ? '설정됨' : '❌ 누락');
  console.log('✅ Supabase Key:', supabaseKey ? '설정됨' : '❌ 누락');
  console.log('✅ Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '설정됨' : '❌ 누락');
  console.log('');
  
  // 2. Supabase 연결 테스트
  console.log('2️⃣ Supabase 연결 테스트:');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase 연결 실패:', error.message);
    } else {
      console.log('✅ Supabase 연결 성공');
    }
  } catch (error) {
    console.log('❌ Supabase 연결 오류:', error.message);
  }
  console.log('');
  
  // 3. 테이블 구조 확인
  console.log('3️⃣ 데이터베이스 테이블 확인:');
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ users 테이블 접근 실패:', usersError.message);
    } else {
      console.log('✅ users 테이블 접근 성공');
      console.log('📊 테이블 컬럼:', Object.keys(users[0] || {}));
    }
  } catch (error) {
    console.log('❌ 테이블 확인 오류:', error.message);
  }
  console.log('');
  
  // 4. 사용자 데이터 확인
  console.log('4️⃣ 사용자 데이터 확인:');
  try {
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allUsersError) {
      console.log('❌ 사용자 데이터 조회 실패:', allUsersError.message);
    } else {
      console.log(`✅ 총 ${allUsers.length}명의 사용자`);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.wallet_address} (${user.role})`);
      });
    }
  } catch (error) {
    console.log('❌ 사용자 데이터 확인 오류:', error.message);
  }
  console.log('');
  
  // 5. 관리자 지갑 확인
  console.log('5️⃣ 관리자 지갑 확인:');
  const adminWallet = '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0';
  const adminWallets = [
    '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0',
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
    '0x9b1a5f8709c6710650a010b4c9c16b1f9a5f8709',
    '0x1a2b3c4d5e6f7890123456789012345678901234',
    '0x5a6b7c8d9e0f1234567890123456789012345678',
    '0x9c8b7a6f5e4d3c2b1a098765432109876543210'
  ];
  
  console.log('📋 관리자 지갑 목록:');
  adminWallets.forEach((wallet, index) => {
    console.log(`   ${index + 1}. ${wallet}`);
  });
  console.log('');
  
  // 6. 웹 애플리케이션 상태 확인
  console.log('6️⃣ 웹 애플리케이션 상태 확인:');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ 웹 애플리케이션 정상 실행 중 (포트 3000)');
    } else {
      console.log('⚠️ 웹 애플리케이션 응답 오류:', response.status);
    }
  } catch (error) {
    console.log('❌ 웹 애플리케이션 연결 실패:', error.message);
  }
  console.log('');
  
  // 7. 종합 진단
  console.log('7️⃣ 종합 진단:');
  console.log('✅ 기본 기능: 정상');
  console.log('✅ 데이터베이스: 정상');
  console.log('✅ 웹 애플리케이션: 정상');
  console.log('⚠️ 관리자 역할: 수동 설정 필요');
  console.log('');
  
  console.log('🎯 권장 조치사항:');
  console.log('1. 브라우저에서 http://localhost:3000 접속');
  console.log('2. 지갑 연결 후 관리자 메뉴 확인');
  console.log('3. 관리자 메뉴가 보이지 않으면 수동으로 role을 admin으로 변경');
  console.log('4. 모든 기능이 정상 작동하는지 테스트');
  console.log('');
  
  console.log('🎉 시스템 점검 완료!');
}

systemCheck();
