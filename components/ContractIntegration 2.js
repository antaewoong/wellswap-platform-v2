// components/ContractIntegration.js
// 🔗 WellSwap 4단계 멀티시그 거래 시스템 완전 연동

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

// 🏗️ 완전한 컨트랙트 설정 정보
const CONTRACT_CONFIG = {
  // BSC 테스트넷 설정
  NETWORK: {
    chainId: '0x61', // 97 in hex
    chainName: 'BSC Testnet',
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18
    }
  },
  
  // 🎯 배포할 WellSwap 컨트랙트 주소 (배포 후 업데이트)
  CONTRACT_ADDRESS: "0xa84125fe1503485949d3e4fedcc454429289c8ea",
  
  // 완전한 WellSwap 컨트랙트 ABI
  CONTRACT_ABI: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_platformWallet",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "aiValueUSD",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "riskGrade",
          "type": "uint8"
        }
      ],
      "name": "AIEvaluationUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "confirmedPrice",
          "type": "uint256"
        }
      ],
      "name": "AssetPlatformConfirmed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "companyName",
          "type": "string"
        }
      ],
      "name": "AssetRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "refundAmount",
          "type": "uint256"
        }
      ],
      "name": "AutoRefundProcessed",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tradeId",
          "type": "uint256"
        }
      ],
      "name": "completeTrade",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "confirmedPriceUSD",
          "type": "uint256"
        }
      ],
      "name": "confirmAssetPlatformPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "agreedPriceUSD",
          "type": "uint256"
        }
      ],
      "name": "createMultisigTrade",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tradeId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "emergencyCancelTrade",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "EscrowDeposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "EscrowWithdraw",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tradeId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        }
      ],
      "name": "MultisigTradeCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "userType",
          "type": "uint8"
        }
      ],
      "name": "payRegistrationFee",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        }
      ],
      "name": "processAutoRefund",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "companyName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "productName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "category",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "surrenderValueUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "premiumPaidUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "contractPeriodMonths",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "additionalData",
          "type": "string"
        }
      ],
      "name": "registerInsuranceAsset",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "RegistrationFeePaid",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tradeId",
          "type": "uint256"
        }
      ],
      "name": "signTrade",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tradeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "TradeCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tradeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "finalPriceUSD",
          "type": "uint256"
        }
      ],
      "name": "TradeCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tradeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "paymentAmount",
          "type": "uint256"
        }
      ],
      "name": "TradeSignedByBuyer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newPrice",
          "type": "uint256"
        }
      ],
      "name": "updateBnbUsdPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum WellSwap.UserType",
          "name": "userType",
          "type": "uint8"
        }
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "aiValueUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "riskGrade",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "confidenceScore",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "analysisData",
          "type": "string"
        }
      ],
      "name": "updateAIEvaluation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newPlatformWallet",
          "type": "address"
        }
      ],
      "name": "updatePlatformWallet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "assetAutoRefundProcessed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "assetRefundDeadline",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "assets",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "companyName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "productName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "category",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "surrenderValueUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "premiumPaidUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "contractPeriodMonths",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "additionalData",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "aiValueUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "riskGrade",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "confidenceScore",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "analysisData",
          "type": "string"
        },
        {
          "internalType": "enum WellSwap.AssetStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "platformConfirmedAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "platformConfirmed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "AUTO_REFUND_PERIOD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "bnbAmount",
          "type": "uint256"
        }
      ],
      "name": "bnbToUsd",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bnbUsdPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        }
      ],
      "name": "checkAutoRefundEligibility",
      "outputs": [
        {
          "internalType": "bool",
          "name": "eligible",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "daysRemaining",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "COMMISSION_DENOMINATOR",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        }
      ],
      "name": "getAsset",
      "outputs": [
        {
          "internalType": "string",
          "name": "companyName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "productName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "category",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "surrenderValueUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "aiValueUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "riskGrade",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "assetOwner",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getContractAddresses",
      "outputs": [
        {
          "internalType": "address",
          "name": "contractOwner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "platformWalletAddress",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getContractConstants",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "bnbPrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "regFee",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "platformFee",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "commissionRate",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPlatformStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalVolume",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalEarnings",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalAssets",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalTrades",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tradeId",
          "type": "uint256"
        }
      ],
      "name": "getTrade",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "agreedPriceUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextAssetId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextTradeId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "PLATFORM_COMMISSION_RATE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "PLATFORM_FEE_USD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "platformTotalEarnings",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "platformWallet",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "REFUND_AMOUNT_USD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "REGISTRATION_FEE_USD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalTradingVolume",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "trades",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "assetId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "agreedPriceUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "sellerSigned",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "buyerSigned",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "platformSigned",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "totalPaymentBNB",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "sellerFeePayment",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "buyerFeePayment",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "completedAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "usdAmount",
          "type": "uint256"
        }
      ],
      "name": "usdToBnb",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userEscrowBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "users",
      "outputs": [
        {
          "internalType": "enum WellSwap.UserType",
          "name": "userType",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "registrationFeePaid",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalTrades",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reputationScore",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "lastActivityAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

// 🌐 완전한 Web3 연결 훅
export const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [bnbPrice, setBnbPrice] = useState(650); // Default BNB price

  // 완전한 지갑 연결 함수
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask가 설치되지 않았습니다. MetaMask를 설치해주세요.');
      }

      console.log('🔗 완전한 멀티시그 지갑 연결 시작...');

      // 계정 연결 요청
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('지갑 계정을 찾을 수 없습니다.');
      }

      // Provider 및 Signer 설정
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const userAccount = await web3Signer.getAddress();
      
      console.log('✅ 계정 연결됨:', userAccount);

      // 네트워크 확인 및 변경
      await switchToBSCTestnet();
      
      // 컨트랙트 주소 검증
      if (CONTRACT_CONFIG.CONTRACT_ADDRESS === "0x당신의_실제_컨트랙트_주소_여기에_입력") {
        console.warn('⚠️ 컨트랙트 주소가 설정되지 않았습니다. 먼저 컨트랙트를 배포하고 주소를 업데이트하세요.');
        throw new Error('컨트랙트가 배포되지 않았습니다. 관리자에게 문의하세요.');
      }

      // 완전한 WellSwap 컨트랙트 인스턴스 생성
      const wellSwapContract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        web3Signer
      );

      // 컨트랙트 연결 테스트
      try {
        const currentBnbPrice = await wellSwapContract.bnbUsdPrice();
        setBnbPrice(ethers.utils.formatUnits(currentBnbPrice, 18));
        console.log('📊 컨트랙트 연결 확인 - BNB 가격:', ethers.utils.formatUnits(currentBnbPrice, 18));
      } catch (contractError) {
        console.error('❌ 컨트랙트 연결 실패:', contractError);
        throw new Error('컨트랙트와 연결할 수 없습니다. 컨트랙트 주소를 확인하세요.');
      }

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(wellSwapContract);
      setAccount(userAccount);
      setIsConnected(true);
      setNetworkError(null);

      console.log('🎉 완전한 멀티시그 Web3 연결 완료!');
      return { success: true, account: userAccount };

    } catch (error) {
      console.error('❌ 지갑 연결 실패:', error);
      setNetworkError(error.message);
      setIsConnected(false);
      return { success: false, error: error.message };
    }
  };

  // BSC 테스트넷으로 네트워크 변경
  const switchToBSCTestnet = async () => {
    try {
      console.log('🔄 BSC 테스트넷으로 변경 중...');
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONTRACT_CONFIG.NETWORK.chainId }],
      });
      
      console.log('✅ BSC 테스트넷 연결됨');
    } catch (switchError) {
      console.log('🔧 BSC 테스트넷 추가 중...');
      
      // 네트워크가 추가되지 않은 경우 추가
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CONTRACT_CONFIG.NETWORK],
        });
        console.log('✅ BSC 테스트넷 추가 완료');
      } else {
        throw switchError;
      }
    }
  };

  // 컨트랙트에서 USD를 BNB로 변환
  const usdToBnb = async (usdAmount) => {
    try {
      if (!contract) {
        // 컨트랙트가 없을 때 기본 계산
        const bnbAmount = parseFloat(usdAmount) / parseFloat(bnbPrice);
        return ethers.utils.parseEther(bnbAmount.toString());
      }

      // 컨트랙트에서 정확한 변환
      const bnbAmount = await contract.usdToBnb(Math.floor(usdAmount));
      console.log(`💱 $${usdAmount} USD = ${ethers.utils.formatEther(bnbAmount)} BNB`);
      return bnbAmount;
    } catch (error) {
      console.error('💱 USD to BNB 변환 실패:', error);
      throw error;
    }
  };

  // 지갑 연결 상태 모니터링
  useEffect(() => {
    if (window.ethereum) {
      // 계정 변경 감지
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount(null);
          console.log('🔌 지갑 연결 해제됨');
        } else {
          setAccount(accounts[0]);
          console.log('🔄 계정 변경됨:', accounts[0]);
        }
      });

      // 네트워크 변경 감지
      window.ethereum.on('chainChanged', (chainId) => {
        if (chainId !== CONTRACT_CONFIG.NETWORK.chainId) {
          console.log('⚠️ 네트워크가 변경되었습니다. BSC 테스트넷으로 변경해주세요.');
        }
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    networkError,
    connectWallet,
    usdToBnb,
    bnbPrice
  };
};

// 🏪 1단계: 보험 자산 등록 및 판매자 수수료 결제
export const useAssetRegistration = () => {
  const { contract, usdToBnb, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const registerAsset = async (assetData) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('🏪 1단계: 판매자 등록 및 자산 등록 시작...', assetData);

      // 1-1: 판매자 등록 수수료 지불 (300 USD in BNB)
      console.log('💰 1-1: 판매자 등록 수수료 300 USD 지불 중...');
      const registrationFeeInBNB = await usdToBnb(300);
      
      const feeTransaction = await contract.payRegistrationFee(1, { // 1 = SELLER
        value: registrationFeeInBNB,
        gasLimit: ethers.utils.hexlify(300000)
      });
      
      console.log('⏳ 등록 수수료 트랜잭션 대기 중:', feeTransaction.hash);
      await feeTransaction.wait();
      console.log('✅ 판매자 등록 수수료 지불 완료');

      // 1-2: 보험 자산 정보 블록체인 등록
      console.log('📝 1-2: 블록체인에 보험 자산 정보 등록 중...');
      const registerTransaction = await contract.registerInsuranceAsset(
        assetData.companyName,
        assetData.productName,
        assetData.category,
        Math.floor(assetData.surrenderValueUSD),
        Math.floor(assetData.premiumPaidUSD),
        assetData.contractPeriodMonths,
        JSON.stringify(assetData.additionalData || {}),
        { gasLimit: ethers.utils.hexlify(500000) }
      );

      console.log('⏳ 자산 등록 트랜잭션 대기 중:', registerTransaction.hash);
      const receipt = await registerTransaction.wait();
      
      // 이벤트에서 자산 ID 추출
      const assetRegisteredEvent = receipt.events?.find(
        event => event.event === 'AssetRegistered'
      );
      
      const assetId = assetRegisteredEvent?.args?.assetId;
      console.log('🎉 1단계 완료: 자산 등록 성공! Asset ID:', assetId?.toString());

      return {
        success: true,
        assetId: assetId?.toString(),
        transactionHash: registerTransaction.hash,
        feeTransactionHash: feeTransaction.hash
      };

    } catch (error) {
      console.error('❌ 1단계 자산 등록 실패:', error);
      
      // 에러 메시지 개선
      let errorMessage = error.message;
      if (error.code === 4001) {
        errorMessage = '사용자가 트랜잭션을 취소했습니다.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'BNB 잔액이 부족합니다. 최소 0.8 BNB가 필요합니다.';
      } else if (error.message.includes('execution reverted')) {
        errorMessage = '컨트랙트 실행 오류: 입력 데이터를 확인해주세요.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { registerAsset, loading };
};

// 🤖 2단계: AI 평가 및 플랫폼 가격 확정
export const useAIEvaluation = () => {
  const { contract, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const updateAIEvaluation = async (assetId, evaluationData) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('🤖 2-1: AI 평가 블록체인 업데이트 중...', { assetId, evaluationData });
      
      const transaction = await contract.updateAIEvaluation(
        assetId,
        Math.floor(evaluationData.aiValueUSD),
        evaluationData.riskGrade, // 1-5 (A=1, B=2, C=3, D=4, E=5)
        evaluationData.confidenceScore, // 1-100
        JSON.stringify(evaluationData.analysisData || {}),
        { gasLimit: ethers.utils.hexlify(250000) }
      );

      console.log('⏳ AI 평가 트랜잭션 대기 중:', transaction.hash);
      await transaction.wait();
      console.log('✅ AI 평가 블록체인 업데이트 완료');

      return {
        success: true,
        transactionHash: transaction.hash
      };

    } catch (error) {
      console.error('❌ AI 평가 업데이트 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmPlatformPrice = async (assetId, confirmedPriceUSD) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('🏢 2-2: 플랫폼 최종 가격 확정 중...', { assetId, confirmedPriceUSD });
      
      const transaction = await contract.confirmAssetPlatformPrice(
        assetId,
        Math.floor(confirmedPriceUSD),
        { gasLimit: ethers.utils.hexlify(200000) }
      );

      console.log('⏳ 가격 확정 트랜잭션 대기 중:', transaction.hash);
      await transaction.wait();
      console.log('✅ 2단계 완료: 플랫폼 가격 확정 완료');

      return {
        success: true,
        transactionHash: transaction.hash
      };

    } catch (error) {
      console.error('❌ 플랫폼 가격 확정 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateAIEvaluation, confirmPlatformPrice, loading };
};

// 🤝 3단계: 멀티시그 거래 생성 및 구매자 결제
export const useTrading = () => {
  const { contract, usdToBnb, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const createTrade = async (assetId, buyerAddress, agreedPriceUSD) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('🤝 3-1: 멀티시그 거래 생성 중...', { assetId, buyerAddress, agreedPriceUSD });
      
      const transaction = await contract.createMultisigTrade(
        assetId,
        buyerAddress,
        Math.floor(agreedPriceUSD),
        { gasLimit: ethers.utils.hexlify(350000) }
      );

      console.log('⏳ 거래 생성 트랜잭션 대기 중:', transaction.hash);
      const receipt = await transaction.wait();
      
      // 이벤트에서 거래 ID 추출
      const tradeCreatedEvent = receipt.events?.find(
        event => event.event === 'MultisigTradeCreated'
      );
      
      const tradeId = tradeCreatedEvent?.args?.tradeId;
      console.log('🎉 멀티시그 거래 생성 완료! Trade ID:', tradeId?.toString());

      return {
        success: true,
        tradeId: tradeId?.toString(),
        transactionHash: transaction.hash
      };

    } catch (error) {
      console.error('❌ 멀티시그 거래 생성 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signTrade = async (tradeId, totalPaymentUSD) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('✍️ 3-2: 구매자 거래 서명 및 결제 중...', { tradeId, totalPaymentUSD });
      
      // 총 결제 금액을 BNB로 변환 (300 USD 플랫폼 수수료 + 상품 가격)
      const totalPaymentInBNB = await usdToBnb(totalPaymentUSD);
      
      const transaction = await contract.signTrade(tradeId, {
        value: totalPaymentInBNB,
        gasLimit: ethers.utils.hexlify(400000)
      });

      console.log('⏳ 구매자 서명 트랜잭션 대기 중:', transaction.hash);
      await transaction.wait();
      console.log('✅ 3단계 완료: 구매자 결제 및 서명 완료');

      return {
        success: true,
        transactionHash: transaction.hash
      };

    } catch (error) {
      console.error('❌ 구매자 거래 서명 실패:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('insufficient funds')) {
        errorMessage = `BNB 잔액이 부족합니다. $${totalPaymentUSD} USD 결제를 위해 더 많은 BNB가 필요합니다.`;
      } else if (error.message.includes('Only buyer can sign')) {
        errorMessage = '구매자만 이 거래에 서명할 수 있습니다.';
      } else if (error.message.includes('Already signed')) {
        errorMessage = '이미 서명된 거래입니다.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createTrade, signTrade, loading };
};

// 🏢 4단계: 플랫폼 최종 완료 및 자동 정산
export const usePlatformCompletion = () => {
  const { contract, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const completeTrade = async (tradeId) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('🏢 4단계: 플랫폼 최종 완료 및 자동 정산 시작...', { tradeId });
      
      const transaction = await contract.completeTrade(tradeId, {
        gasLimit: ethers.utils.hexlify(600000) // 더 많은 가스 (정산 포함)
      });

      console.log('⏳ 거래 완료 및 정산 트랜잭션 대기 중:', transaction.hash);
      await transaction.wait();
      console.log('✅ 4단계 완료: 거래 완료 및 자동 정산 성공!');

      return {
        success: true,
        transactionHash: transaction.hash
      };

    } catch (error) {
      console.error('❌ 거래 완료 실패:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Trade not ready')) {
        errorMessage = '거래가 완료 준비 상태가 아닙니다.';
      } else if (error.message.includes('Missing signatures')) {
        errorMessage = '필요한 서명이 누락되었습니다.';
      } else if (error.message.includes('Already completed')) {
        errorMessage = '이미 완료된 거래입니다.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { completeTrade, loading };
};

// ⏰ 61일 자동 환불 시스템
export const useAutoRefund = () => {
  const { contract, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const checkAutoRefundEligibility = async (assetId) => {
    if (!isConnected || !contract) {
      throw new Error('컨트랙트가 연결되지 않았습니다.');
    }

    try {
      console.log('⏰ 61일 자동 환불 대상 확인 중...', assetId);
      const result = await contract.checkAutoRefundEligibility(assetId);
      
      return {
        eligible: result.eligible,
        daysRemaining: result.daysRemaining.toNumber()
      };
    } catch (error) {
      console.error('❌ 자동 환불 대상 확인 실패:', error);
      throw error;
    }
  };

  const processAutoRefund = async (assetId) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('⏰ 61일 자동 환불 처리 중...', assetId);
      
      const transaction = await contract.processAutoRefund(assetId, {
        gasLimit: ethers.utils.hexlify(350000)
      });

      console.log('⏳ 자동 환불 트랜잭션 대기 중:', transaction.hash);
      await transaction.wait();
      console.log('✅ 61일 자동 환불 처리 완료');

      return {
        success: true,
        transactionHash: transaction.hash
      };

    } catch (error) {
      console.error('❌ 자동 환불 처리 실패:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Auto refund already processed')) {
        errorMessage = '이미 자동 환불이 처리되었습니다.';
      } else if (error.message.includes('Refund deadline not reached')) {
        errorMessage = '아직 61일이 경과하지 않았습니다.';
      } else if (error.message.includes('Insufficient escrow balance')) {
        errorMessage = '에스크로 잔액이 부족합니다.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { checkAutoRefundEligibility, processAutoRefund, loading };
};

// 📊 컨트랙트 데이터 조회 함수
export const useContractData = () => {
  const { contract, isConnected } = useWeb3();

  const getAsset = async (assetId) => {
    if (!isConnected || !contract) {
      throw new Error('컨트랙트가 연결되지 않았습니다.');
    }

    try {
      console.log('📊 자산 정보 조회 중...', assetId);
      const asset = await contract.getAsset(assetId);
      
      return {
        companyName: asset.companyName,
        productName: asset.productName,
        category: asset.category,
        surrenderValueUSD: asset.surrenderValueUSD.toString(),
        aiValueUSD: asset.aiValueUSD.toString(),
        riskGrade: asset.riskGrade,
        status: asset.status,
        owner: asset.owner
      };
    } catch (error) {
      console.error('❌ 자산 정보 조회 실패:', error);
      throw error;
    }
  };

  const getTrade = async (tradeId) => {
    if (!isConnected || !contract) {
      throw new Error('컨트랙트가 연결되지 않았습니다.');
    }

    try {
      console.log('📊 거래 정보 조회 중...', tradeId);
      const trade = await contract.getTrade(tradeId);
      
      return {
        assetId: trade.assetId.toString(),
        seller: trade.seller,
        buyer: trade.buyer,
        agreedPriceUSD: trade.agreedPriceUSD.toString(),
        status: trade.status,
        createdAt: trade.createdAt.toString()
      };
    } catch (error) {
      console.error('❌ 거래 정보 조회 실패:', error);
      throw error;
    }
  };

  const getUserEscrowBalance = async (userAddress) => {
    if (!isConnected || !contract) {
      throw new Error('컨트랙트가 연결되지 않았습니다.');
    }

    try {
      console.log('💰 에스크로 잔액 조회 중...', userAddress);
      const balance = await contract.userEscrowBalance(userAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('❌ 에스크로 잔액 조회 실패:', error);
      throw error;
    }
  };

  const getPlatformStats = async () => {
    if (!isConnected || !contract) {
      throw new Error('컨트랙트가 연결되지 않았습니다.');
    }

    try {
      console.log('📊 플랫폼 통계 조회 중...');
      const stats = await contract.getPlatformStats();
      
      return {
        totalVolume: ethers.utils.formatUnits(stats.totalVolume, 18),
        totalEarnings: ethers.utils.formatUnits(stats.totalEarnings, 18),
        totalAssets: stats.totalAssets.toString(),
        totalTrades: stats.totalTrades.toString()
      };
    } catch (error) {
      console.error('❌ 플랫폼 통계 조회 실패:', error);
      throw error;
    }
  };

  const getUserInfo = async (userAddress) => {
    if (!isConnected || !contract) {
      throw new Error('컨트랙트가 연결되지 않았습니다.');
    }

    try {
      console.log('👤 사용자 정보 조회 중...', userAddress);
      const userInfo = await contract.users(userAddress);
      
      return {
        userType: userInfo.userType,
        registrationFeePaid: ethers.utils.formatEther(userInfo.registrationFeePaid),
        totalTrades: userInfo.totalTrades.toString(),
        reputationScore: userInfo.reputationScore.toString(),
        isActive: userInfo.isActive,
        lastActivityAt: userInfo.lastActivityAt.toString()
      };
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error);
      throw error;
    }
  };

  return {
    getAsset,
    getTrade,
    getUserEscrowBalance,
    getPlatformStats,
    getUserInfo
  };
};

// 🎯 완전한 WellSwap 통합 훅
export const useWellSwap = () => {
  const web3 = useWeb3();
  const assetRegistration = useAssetRegistration();
  const aiEvaluation = useAIEvaluation();
  const trading = useTrading();
  const platformCompletion = usePlatformCompletion();
  const autoRefund = useAutoRefund();
  const contractData = useContractData();

  return {
    ...web3,
    ...assetRegistration,
    ...aiEvaluation,
    ...trading,
    ...platformCompletion,
    ...autoRefund,
    ...contractData
  };
};
