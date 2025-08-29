const fs = require('fs');

// 솔라나 테스트넷 공식 USDT 주소들
const OFFICIAL_TEST_TOKENS = {
  devnet: {
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // 공식 테스트 USDT
    USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // 공식 테스트 USDC
    SOL: 'So11111111111111111111111111111111111111112'     // 래핑된 SOL
  },
  testnet: {
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    SOL: 'So11111111111111111111111111111111111111112'
  }
};

function setupOfficialTestTokens() {
  console.log('🔧 솔라나 테스트넷 공식 USDT 설정');
  
  const network = 'devnet';
  const tokens = OFFICIAL_TEST_TOKENS[network];
  
  console.log('📋 사용할 토큰 주소:');
  console.log('USDT:', tokens.USDT);
  console.log('USDC:', tokens.USDC);
  console.log('SOL:', tokens.SOL);
  
  // 환경변수 설정 파일 생성
  const envContent = `# 솔라나 테스트넷 설정
NEXT_PUBLIC_SOLANA_NETWORK=${network}
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_USDT_MINT_ADDRESS=${tokens.USDT}
NEXT_PUBLIC_USDC_MINT_ADDRESS=${tokens.USDC}
NEXT_PUBLIC_REGISTRATION_FEE_USDT=0.1
NEXT_PUBLIC_REGISTRATION_FEE_USDC=0.1

# 관리자 지갑 (기존 설정 유지)
NEXT_PUBLIC_ADMIN_WALLET_1=HhYmywR1Nr9YWgT4NbBHsa6F8y2viYWhVbsy4s2J38kg

# 기타 설정
NEXT_PUBLIC_SOLANA_PROGRAM_ID=your_program_id_here
`;

  // .env.local 파일 업데이트
  const envLocalPath = './.env.local';
  let existingContent = '';
  
  if (fs.existsSync(envLocalPath)) {
    existingContent = fs.readFileSync(envLocalPath, 'utf8');
  }
  
  // 기존 솔라나 관련 설정 제거하고 새로 추가
  const lines = existingContent.split('\n');
  const filteredLines = lines.filter(line => 
    !line.startsWith('NEXT_PUBLIC_SOLANA_') && 
    !line.startsWith('NEXT_PUBLIC_USDT_') && 
    !line.startsWith('NEXT_PUBLIC_USDC_') &&
    line.trim() !== ''
  );
  
  const newContent = filteredLines.join('\n') + '\n\n' + envContent;
  fs.writeFileSync(envLocalPath, newContent);
  
  console.log('✅ .env.local 파일 업데이트 완료');
  
  // 설정 정보 출력
  console.log('\n🎯 설정 완료!');
  console.log('📝 다음 단계:');
  console.log('1. 서버 재시작: npm run dev');
  console.log('2. 솔플레어 지갑에서 테스트 USDT 받기');
  console.log('3. 거래 테스트 진행');
  
  console.log('\n💡 테스트 USDT 받는 방법:');
  console.log('1. https://faucet.solana.com 방문');
  console.log('2. 지갑 주소 입력');
  console.log('3. "Devnet USDT" 선택하여 받기');
  console.log('4. 또는 https://solfaucet.com 에서 받기');
  
  return tokens;
}

// 스크립트 실행
setupOfficialTestTokens();
