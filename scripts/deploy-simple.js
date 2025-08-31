// 간단한 배포 스크립트
async function main() {
  console.log("🚀 WellSwap 컨트랙트 배포 시작...");
  
  const AMOY_USDC = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  
  const [deployer] = await ethers.getSigners();
  console.log("📍 배포자 주소:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 MATIC 잔액:", ethers.formatEther(balance));
  
  const WellSwapMultisig = await ethers.getContractFactory("WellSwapMultisig");
  console.log("📄 컨트랙트 팩토리 생성 완료");
  
  const contract = await WellSwapMultisig.deploy(AMOY_USDC);
  console.log("⏳ 배포 진행 중...");
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("✅ 배포 완료!");
  console.log("📍 컨트랙트 주소:", address);
  console.log("🪙 USDC 주소:", AMOY_USDC);
  
  console.log("\n🔧 환경변수 업데이트:");
  console.log(`NEXT_PUBLIC_WELLSWAP_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error("❌ 배포 실패:", error);
  process.exit(1);
});