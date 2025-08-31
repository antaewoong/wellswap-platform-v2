import hre from "hardhat";
import { ethers } from "ethers";
import dotenv from "dotenv";

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

async function main() {
  console.log("🚀 WellSwap 멀티시그 컨트랙트 배포 시작...");
  
  // Amoy 테스트넷 USDC 주소 (Circle 공식)
  const AMOY_USDC = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  
  // ethers v6 방식으로 provider와 signer 설정
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY 환경변수가 설정되지 않았습니다.");
  }
  const deployer = new ethers.Wallet(privateKey, provider);
  console.log("📍 배포자 주소:", deployer.address);
  
  const balance = await provider.getBalance(deployer.address);
  console.log("💰 MATIC 잔액:", ethers.formatEther(balance), "MATIC");
  
  if (balance === 0n) {
    throw new Error("❌ MATIC 잔액이 부족합니다. Faucet에서 토큰을 받아주세요.");
  }
  
  console.log("📄 컨트랙트 팩토리 생성 중...");
  // 컨트랙트 소스 컴파일 정보 읽기
  const contractJson = await import("../artifacts/contracts/WellSwapMultisig.sol/WellSwapMultisig.json", { with: { type: "json" } });
  const contractFactory = new ethers.ContractFactory(contractJson.default.abi, contractJson.default.bytecode, deployer);
  
  console.log("⏳ 컨트랙트 배포 중...");
  const contract = await contractFactory.deploy(AMOY_USDC);
  
  console.log("⏳ 배포 확인 중...");
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("\n🎉 배포 성공!");
  console.log("📍 컨트랙트 주소:", contractAddress);
  console.log("🪙 USDC 주소:", AMOY_USDC);
  console.log("💰 등록비: 0.01 USDC");
  console.log("📊 플랫폼 수수료: 2.5%");
  console.log("⏰ 만료 기간: 61일");
  
  console.log("\n🔧 환경변수 업데이트:");
  console.log(`NEXT_PUBLIC_WELLSWAP_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_AMOY_USDC_ADDRESS=${AMOY_USDC}`);
  
  console.log("\n🌐 Amoy 테스트넷 정보:");
  console.log("- 네트워크: Polygon Amoy Testnet");
  console.log("- Chain ID: 80002");
  console.log("- Explorer:", `https://amoy.polygonscan.com/address/${contractAddress}`);
  
  return {
    contractAddress,
    usdcAddress: AMOY_USDC,
    deployerAddress: deployer.address
  };
}

main()
  .then((result) => {
    console.log("\n✅ 배포 완료!", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 배포 실패:", error);
    process.exit(1);
  });