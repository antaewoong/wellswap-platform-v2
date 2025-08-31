import { ethers } from "ethers";
import dotenv from "dotenv";

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

async function main() {
  console.log("💰 등록비를 0.01 USDC로 변경 중...");
  
  const contractAddress = "0x8CaD4c08dA04d2251185897923DDd923f0F4Ec86";
  
  // Provider와 Signer 설정
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY 환경변수가 설정되지 않았습니다.");
  }
  const signer = new ethers.Wallet(privateKey, provider);
  
  // 컨트랙트 ABI
  const contractABI = [
    "function setRegistrationFee(uint256 _newFee) external",
    "function registrationFee() view returns (uint256)",
    "function isAdmin(address) view returns (bool)"
  ];
  
  // 컨트랙트 인스턴스 생성
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
  try {
    console.log("📍 컨트랙트 주소:", contractAddress);
    console.log("👤 요청자 주소:", signer.address);
    
    // 현재 등록비 확인
    const currentFee = await contract.registrationFee();
    console.log("💰 현재 등록비:", ethers.formatUnits(currentFee, 6), "USDC");
    
    // 관리자 권한 확인
    const isAdmin = await contract.isAdmin(signer.address);
    console.log("🔑 관리자 권한:", isAdmin ? "있음" : "없음");
    
    if (!isAdmin) {
      throw new Error("❌ 관리자 권한이 없습니다.");
    }
    
    // 0.01 USDC로 변경 (USDC는 6 decimals)
    const newFee = ethers.parseUnits("0.01", 6); // 10000
    console.log("⏳ 등록비 변경 트랜잭션 전송 중...");
    
    const tx = await contract.setRegistrationFee(newFee);
    console.log("📝 트랜잭션 해시:", tx.hash);
    
    console.log("⏳ 트랜잭션 확인 중...");
    await tx.wait();
    
    // 변경된 등록비 확인
    const updatedFee = await contract.registrationFee();
    console.log("✅ 새로운 등록비:", ethers.formatUnits(updatedFee, 6), "USDC");
    
    console.log("\\n🎉 등록비 변경 완료!");
    console.log("🌐 탐색기:", `https://amoy.polygonscan.com/tx/${tx.hash}`);
    
  } catch (error) {
    console.error("❌ 등록비 변경 실패:", error.message);
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