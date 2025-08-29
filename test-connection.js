// test-connection.js - Supabase 연결 테스트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cwqoujyckwetdyxzmaym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cW91anlja3dldGR5eHptYXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODQ5NTgsImV4cCI6MjA3MDY2MDk1OH0.ESZ7M3EYIKkOErzizEdE2gZMEgTn16gg3g_bsKEYUwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...');
  
  try {
    // 1. 기본 연결 테스트
    console.log('1️⃣ 기본 연결 확인...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 연결 실패:', error);
      return;
    }
    
    console.log('✅ 기본 연결 성공');
    
    // 2. 테이블 구조 확인
    console.log('2️⃣ 테이블 구조 확인...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ users 테이블 접근 실패:', usersError);
    } else {
      console.log('✅ users 테이블 접근 성공');
      console.log('📊 테이블 구조:', Object.keys(users[0] || {}));
    }
    
    // 3. 관리자 지갑 확인
    console.log('3️⃣ 관리자 지갑 확인...');
    const adminWallet = '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0';
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', adminWallet.toLowerCase())
      .single();
    
    if (adminError) {
      console.log('⚠️ 관리자 사용자가 없습니다. 새로 생성합니다...');
      
      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert([{
          wallet_address: adminWallet.toLowerCase(),
          role: 'admin',
          reputation_score: 100,
          total_trades: 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ 관리자 사용자 생성 실패:', createError);
      } else {
        console.log('✅ 관리자 사용자 생성 성공:', newAdmin);
      }
    } else {
      console.log('✅ 관리자 사용자 확인:', adminUser);
    }
    
    console.log('🎉 모든 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

testConnection();
