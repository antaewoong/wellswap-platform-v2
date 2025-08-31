import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const balance = await provider.getBalance(signer.address);
  console.log("💰 현재 MATIC 잔액:", ethers.formatEther(balance), "MATIC");
  console.log("📍 지갑 주소:", signer.address);
  
  // 배포에 필요한 대략적인 가스 비용 계산
  const gasPrice = await provider.getFeeData();
  console.log("⛽ 현재 Gas Price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
  
  // 대략적인 배포 비용 (2,000,000 gas 기준)
  const estimatedCost = gasPrice.gasPrice * BigInt(2000000);
  console.log("💸 예상 배포 비용:", ethers.formatEther(estimatedCost), "MATIC");
  
  if (balance > estimatedCost) {
    console.log("✅ 배포 가능!");
  } else {
    console.log("❌ MATIC 부족. 추가로 필요한 양:", ethers.formatEther(estimatedCost - balance), "MATIC");
    console.log("🚰 Faucet에서 MATIC 받기: https://faucet.polygon.technology/");
  }
}

main().catch(console.error);