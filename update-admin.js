// update-admin.js - 관리자 역할 업데이트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cwqoujyckwetdyxzmaym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cW91anlja3dldGR5eHptYXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODQ5NTgsImV4cCI6MjA3MDY2MDk1OH0.ESZ7M3EYIKkOErzizEdE2gZMEgTn16gg3g_bsKEYUwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAdminRole() {
  console.log('🔧 관리자 역할 업데이트 시작...');
  
  try {
    const adminWallet = '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0';
    
    // 관리자 역할로 업데이트
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', adminWallet.toLowerCase())
      .select()
      .single();
    
    if (error) {
      console.error('❌ 관리자 역할 업데이트 실패:', error);
      return;
    }
    
    console.log('✅ 관리자 역할 업데이트 성공:', data);
    console.log('🎉 이제 관리자 메뉴가 표시됩니다!');
    
  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error);
  }
}

updateAdminRole();
