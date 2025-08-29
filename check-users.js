// check-users.js - 모든 사용자 확인
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cwqoujyckwetdyxzmaym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cW91anlja3dldGR5eHptYXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODQ5NTgsImV4cCI6MjA3MDY2MDk1OH0.ESZ7M3EYIKkOErzizEdE2gZMEgTn16gg3g_bsKEYUwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('👥 모든 사용자 확인...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ 사용자 조회 실패:', error);
      return;
    }
    
    console.log(`📊 총 ${data.length}명의 사용자가 있습니다:`);
    data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.wallet_address} (${user.role}) - ${user.created_at}`);
    });
    
    // 관리자 지갑 확인
    const adminWallet = '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0';
    const adminUser = data.find(user => user.wallet_address === adminWallet.toLowerCase());
    
    if (adminUser) {
      console.log('\n🎯 관리자 사용자 발견:', adminUser);
    } else {
      console.log('\n⚠️ 관리자 지갑을 가진 사용자가 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ 확인 중 오류 발생:', error);
  }
}

checkUsers();
