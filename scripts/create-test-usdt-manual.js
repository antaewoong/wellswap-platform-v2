const { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction 
} = require('@solana/web3.js');
const { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  TOKEN_PROGRAM_ID 
} = require('@solana/spl-token');
const fs = require('fs');

// 솔라나 테스트넷 연결
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function createTestUSDTManual() {
  try {
    console.log('🔧 솔라나 테스트넷 USDT 토큰 발행 (수동 SOL)');
    
    // 1. 기존 키페어 로드 또는 새로 생성
    let walletKeypair;
    const keypairPath = './test-wallet-keypair.json';
    
    if (fs.existsSync(keypairPath)) {
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      walletKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
      console.log('✅ 기존 테스트 지갑 로드됨');
    } else {
      walletKeypair = Keypair.generate();
      fs.writeFileSync(keypairPath, JSON.stringify(Array.from(walletKeypair.secretKey)));
      console.log('✅ 새 테스트 지갑 생성됨');
    }
    
    console.log('💰 지갑 주소:', walletKeypair.publicKey.toString());
    
    // 2. SOL 잔액 확인
    const balance = await connection.getBalance(walletKeypair.publicKey);
    console.log('💎 현재 SOL 잔액:', balance / 1000000000, 'SOL');
    
    if (balance < 50000000) { // 0.05 SOL 미만이면
      console.log('\n⚠️  SOL이 부족합니다!');
      console.log('다음 방법으로 SOL을 받으세요:');
      console.log('1. https://faucet.solana.com 방문');
      console.log('2. 지갑 주소 입력:', walletKeypair.publicKey.toString());
      console.log('3. 최소 0.1 SOL 받기');
      console.log('4. 이 스크립트를 다시 실행하세요.\n');
      return;
    }
    
    // 3. USDT 토큰 민트 생성
    console.log('🪙 USDT 토큰 민트 생성 중...');
    const usdtMint = await createMint(
      connection,
      walletKeypair,
      walletKeypair.publicKey,
      walletKeypair.publicKey,
      6 // USDT는 6자리 소수점
    );
    
    console.log('✅ USDT 민트 주소:', usdtMint.toString());
    
    // 4. USDT 토큰 계정 생성
    console.log('🏦 USDT 토큰 계정 생성 중...');
    const usdtTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      walletKeypair,
      usdtMint,
      walletKeypair.publicKey
    );
    
    console.log('✅ USDT 토큰 계정:', usdtTokenAccount.address.toString());
    
    // 5. USDT 토큰 발행 (1,000,000 USDT)
    console.log('💸 USDT 토큰 발행 중...');
    const mintAmount = 1000000 * Math.pow(10, 6); // 1,000,000 USDT (6자리 소수점)
    
    await mintTo(
      connection,
      walletKeypair,
      usdtMint,
      usdtTokenAccount.address,
      walletKeypair,
      mintAmount
    );
    
    console.log('✅ USDT 토큰 발행 완료!');
    
    // 6. 설정 파일 생성
    const config = {
      network: 'devnet',
      usdtMintAddress: usdtMint.toString(),
      usdtTokenAccount: usdtTokenAccount.address.toString(),
      walletAddress: walletKeypair.publicKey.toString(),
      keypairPath: keypairPath,
      mintAmount: mintAmount,
      decimals: 6
    };
    
    fs.writeFileSync('./test-usdt-config.json', JSON.stringify(config, null, 2));
    console.log('📄 설정 파일 저장됨: test-usdt-config.json');
    
    // 7. 환경변수 업데이트 안내
    console.log('\n🎯 다음 환경변수를 .env.local에 추가하세요:');
    console.log(`NEXT_PUBLIC_USDT_MINT_ADDRESS=${usdtMint.toString()}`);
    console.log(`NEXT_PUBLIC_REGISTRATION_FEE_USDT=0.1`);
    console.log(`NEXT_PUBLIC_SOLANA_NETWORK=devnet`);
    console.log(`NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com`);
    
    console.log('\n🎉 테스트 USDT 토큰 발행 완료!');
    console.log('💰 발행된 USDT:', mintAmount / Math.pow(10, 6), 'USDT');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 스크립트 실행
createTestUSDTManual();
