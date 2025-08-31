import { ethers } from "ethers";
import dotenv from "dotenv";

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

async function main() {
  console.log("🔧 WellSwap 수수료 업데이트 시작...");
  
  const contractAddress = "0x78198e6862bAae2D448Ef80f94f09184b3188973";
  const AMOY_USDC = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  
  // Provider와 Signer 설정
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY 환경변수가 설정되지 않았습니다.");
  }
  const signer = new ethers.Wallet(privateKey, provider);
  console.log("📍 호출자 주소:", signer.address);
  
  // 컨트랙트 ABI (필요한 함수들만)
  const contractABI = [
    "function setRegistrationFee(uint256 _newFee) external",
    "function setPlatformFeePercent(uint256 _newFeePercent) external", 
    "function registrationFee() view returns (uint256)",
    "function platformFeePercent() view returns (uint256)",
    "function isAdmin(address) view returns (bool)"
  ];
  
  // 컨트랙트 인스턴스 생성
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
  console.log("🔍 현재 설정 확인 중...");
  
  try {
    // 현재 설정 조회
    const currentRegFee = await contract.registrationFee();
    const currentPlatformFee = await contract.platformFeePercent();
    const isAdmin = await contract.isAdmin(signer.address);
    
    console.log("📊 현재 등록비:", ethers.formatUnits(currentRegFee, 6), "USDC");
    console.log("📊 현재 플랫폼 수수료:", currentPlatformFee.toString() / 100, "%");
    console.log("🔑 관리자 권한:", isAdmin ? "있음" : "없음");
    
    if (!isAdmin) {
      throw new Error("❌ 관리자 권한이 없습니다. 컨트랙트 소유자만 수수료를 변경할 수 있습니다.");
    }
    
    // 등록비를 0.01 USDC (10000 wei, USDC는 6 decimals)로 변경
    const newRegFee = ethers.parseUnits("0.01", 6); // 10000
    
    console.log("⏳ 등록비 변경 중...");
    const tx1 = await contract.setRegistrationFee(newRegFee);
    console.log("📝 트랜잭션 해시:", tx1.hash);
    await tx1.wait();
    console.log("✅ 등록비 변경 완료!");
    
    // 변경된 값 확인
    const updatedRegFee = await contract.registrationFee();
    console.log("📊 변경된 등록비:", ethers.formatUnits(updatedRegFee, 6), "USDC");
    
    console.log("\\n🎉 수수료 업데이트 완료!");
    console.log("📍 컨트랙트 주소:", contractAddress);
    console.log("💰 새 등록비: 0.01 USDC");
    console.log("🌐 Amoy 탐색기:", `https://amoy.polygonscan.com/address/${contractAddress}`);
    
  } catch (error) {
    if (error.code === 'CALL_EXCEPTION') {
      console.error("❌ 컨트랙트 호출 실패:");
      console.error("- 관리자 권한이 없거나");  
      console.error("- 컨트랙트에 해당 함수가 없을 수 있습니다.");
      console.error("- 현재 컨트랙트가 이전 버전일 수 있습니다.");
    } else {
      console.error("❌ 오류 발생:", error.message);
    }
    throw error;
  }
}

main()
  .then(() => {
    console.log("\\n✅ 작업 완료!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 실행 실패:", error.message);
    process.exit(1);
  });