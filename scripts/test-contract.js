import { ethers } from "ethers";
import dotenv from "dotenv";

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

async function main() {
  console.log("🧪 새로운 WellSwap 컨트랙트 테스트...");
  
  const contractAddress = "0x8CaD4c08dA04d2251185897923DDd923f0F4Ec86";
  
  // Provider 설정
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  
  // 컨트랙트 ABI (테스트용)
  const testABI = [
    "function registrationFee() view returns (uint256)",
    "function platformFeePercent() view returns (uint256)",
    "function isAdmin(address) view returns (bool)",
    "function owner() view returns (address)"
  ];
  
  // 컨트랙트 인스턴스 생성
  const contract = new ethers.Contract(contractAddress, testABI, provider);
  
  try {
    console.log("📍 컨트랙트 주소:", contractAddress);
    
    // 등록비 확인
    const regFee = await contract.registrationFee();
    console.log("💰 등록비:", ethers.formatUnits(regFee, 6), "USDC");
    
    // 플랫폼 수수료율 확인
    const platformFee = await contract.platformFeePercent();
    console.log("📊 플랫폼 수수료율:", Number(platformFee) / 100, "%");
    
    // 소유자 확인
    const owner = await contract.owner();
    console.log("👤 컨트랙트 소유자:", owner);
    
    // 현재 지갑이 관리자인지 확인
    const privateKey = process.env.PRIVATE_KEY;
    if (privateKey) {
      const wallet = new ethers.Wallet(privateKey);
      const isAdmin = await contract.isAdmin(wallet.address);
      console.log("🔑 현재 지갑 관리자 권한:", isAdmin ? "있음" : "없음");
      console.log("📱 현재 지갑 주소:", wallet.address);
    }
    
    console.log("\n✅ 컨트랙트 테스트 완료!");
    console.log("🌐 Amoy 탐색기:", `https://amoy.polygonscan.com/address/${contractAddress}`);
    
  } catch (error) {
    console.error("❌ 컨트랙트 테스트 실패:", error.message);
  }
}

main().catch(console.error);