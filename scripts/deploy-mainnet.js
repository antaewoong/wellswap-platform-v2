import hre from "hardhat";
import { ethers } from "ethers";
import dotenv from "dotenv";

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

async function main() {
  console.log("🚀 WellSwap 멀티시그 컨트랙트 POLYGON 메인넷 배포 시작...");
  
  // Polygon 메인넷 USDC 주소 (Circle 공식)
  const POLYGON_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  
  // ethers v6 방식으로 provider와 signer 설정
  const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY 환경변수가 설정되지 않았습니다.");
  }
  const deployer = new ethers.Wallet(privateKey, provider);
  console.log("📍 배포자 주소:", deployer.address);
  
  const balance = await provider.getBalance(deployer.address);
  console.log("💰 MATIC 잔액:", ethers.formatEther(balance), "MATIC");
  
  if (balance === 0n) {
    throw new Error("❌ MATIC 잔액이 부족합니다. MATIC을 구매해주세요.");
  }
  
  // 최소 0.1 MATIC 필요 (메인넷 배포 비용)
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("❌ 메인넷 배포를 위해 최소 0.1 MATIC이 필요합니다.");
  }
  
  console.log("📄 컨트랙트 팩토리 생성 중...");
  // 컨트랙트 소스 컴파일 정보 읽기
  const contractJson = await import("../artifacts/contracts/WellSwapMultisig.sol/WellSwapMultisig.json", { with: { type: "json" } });
  const contractFactory = new ethers.ContractFactory(contractJson.default.abi, contractJson.default.bytecode, deployer);
  
  console.log("⏳ Polygon 메인넷에 컨트랙트 배포 중...");
  console.log("💰 초기 등록비: 0.01 USDC");
  console.log("📊 플랫폼 수수료: 2.5%");
  
  const contract = await contractFactory.deploy(POLYGON_USDC, {
    gasLimit: 3000000, // 메인넷용 충분한 가스
    gasPrice: ethers.parseUnits("50", "gwei") // 적정 가스 가격
  });
  
  console.log("⏳ 배포 확인 중...");
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("\n🎉 Polygon 메인넷 배포 성공!");
  console.log("📍 컨트랙트 주소:", contractAddress);
  console.log("🪙 USDC 주소:", POLYGON_USDC);
  console.log("💰 등록비: 0.01 USDC");
  console.log("📊 플랫폼 수수료: 2.5%");
  console.log("⏰ 만료 기간: 61일");
  
  console.log("\n🔧 환경변수 업데이트:");
  console.log(`NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com`);
  console.log(`NEXT_PUBLIC_POLYGON_CHAIN_ID=137`);
  console.log(`NEXT_PUBLIC_WELLSWAP_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_POLYGON_USDC_ADDRESS=${POLYGON_USDC}`);
  
  console.log("\n🌐 Polygon 메인넷 정보:");
  console.log("- 네트워크: Polygon Mainnet");
  console.log("- Chain ID: 137");
  console.log("- Explorer:", `https://polygonscan.com/address/${contractAddress}`);
  console.log("- USDC Contract:", `https://polygonscan.com/token/${POLYGON_USDC}`);
  
  return {
    contractAddress,
    usdcAddress: POLYGON_USDC,
    deployerAddress: deployer.address
  };
}

main()
  .then((result) => {
    console.log("\n✅ Polygon 메인넷 배포 완료!", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 배포 실패:", error);
    process.exit(1);
  });