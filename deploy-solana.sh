#!/bin/bash

echo "🚀 Solana WellSwap Insurance Program Deployment"
echo "================================================"

# 1. Anchor 빌드
echo "📦 Building Anchor program..."
anchor build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# 2. 프로그램 ID 확인
echo "🔍 Checking program ID..."
PROGRAM_ID=$(solana address -k target/deploy/wellswap_insurance-keypair.json)
echo "Program ID: $PROGRAM_ID"

# 3. Devnet 설정
echo "🌐 Setting up Devnet..."
solana config set --url devnet

# 4. 지갑 확인
echo "💰 Checking wallet balance..."
WALLET_ADDRESS=$(solana address)
BALANCE=$(solana balance)

echo "Wallet: $WALLET_ADDRESS"
echo "Balance: $BALANCE"

# 5. 잔액이 부족하면 에어드롭
if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "💸 Requesting airdrop..."
    solana airdrop 2
    sleep 2
    BALANCE=$(solana balance)
    echo "New balance: $BALANCE"
fi

# 6. 프로그램 배포
echo "🚀 Deploying program to Devnet..."
anchor deploy --provider.cluster devnet

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Program deployed successfully!"

# 7. 배포 확인
echo "🔍 Verifying deployment..."
solana program show $PROGRAM_ID

echo "🎉 Deployment completed!"
echo "Program ID: $PROGRAM_ID"
echo "Network: Devnet"
echo "RPC URL: https://api.devnet.solana.com"
