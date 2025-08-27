// components/ContractIntegration.ts
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
  
  // 🎯 배포된 WellSwap 컨트랙트 주소 (BSC 테스트넷)
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
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "productName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "category",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "surrenderValueUSD",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "contractPeriod",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "annualPaymentUSD",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalPaymentUSD",
          "type": "uint256"
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
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "agreedPriceUSD",
          "type": "uint256"
        }
      ],
      "name": "TradeCreated",
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
          "name": "totalPaymentUSD",
          "type": "uint256"
        }
      ],
      "name": "TradeSigned",
      "type": "event"
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
      "name": "confirmPlatformPrice",
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
          "name": "contractPeriod",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "annualPaymentUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPaymentUSD",
          "type": "uint256"
        }
      ],
      "name": "registerAsset",
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
          "name": "assetId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "buyerAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "agreedPriceUSD",
          "type": "uint256"
        }
      ],
      "name": "createTrade",
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
          "internalType": "uint256",
          "name": "totalPaymentUSD",
          "type": "uint256"
        }
      ],
      "name": "signTrade",
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
      "name": "getAsset",
      "outputs": [
        {
          "components": [
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
              "name": "owner",
              "type": "address"
            }
          ],
          "internalType": "struct WellSwap.Asset",
          "name": "",
          "type": "tuple"
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
          "components": [
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
            },
            {
              "internalType": "uint8",
              "name": "status",
              "type": "uint8"
            }
          ],
          "internalType": "struct WellSwap.Trade",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getUserEscrowBalance",
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
      "name": "getPlatformStats",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "totalAssets",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalTrades",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalVolumeUSD",
              "type": "uint256"
            }
          ],
          "internalType": "struct WellSwap.PlatformStats",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

// 타입 정의
interface AssetData {
  companyName: string;
  productName: string;
  category: string;
  surrenderValueUSD: number;
  contractPeriod: string;
  annualPaymentUSD: number;
  totalPaymentUSD: number;
}

interface EvaluationData {
  aiValueUSD: number;
  riskGrade: number;
  confidence: number;
}

interface TradeData {
  assetId: string;
  buyerAddress: string;
  agreedPriceUSD: number;
}

interface Web3State {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  account: string | null;
  isConnected: boolean;
  networkError: string | null;
  connectWallet: () => Promise<void>;
  usdToBnb: (usdAmount: number) => Promise<string>;
}

interface AssetRegistrationState {
  registerAsset: (assetData: AssetData) => Promise<{
    success: boolean;
    assetId: string;
    transactionHash: string;
    feeTransactionHash: string;
  }>;
  loading: boolean;
}

interface AIEvaluationState {
  updateAIEvaluation: (assetId: string, evaluationData: EvaluationData) => Promise<{
    success: boolean;
    transactionHash: string;
  }>;
  confirmPlatformPrice: (assetId: string, confirmedPriceUSD: number) => Promise<{
    success: boolean;
    transactionHash: string;
  }>;
  loading: boolean;
}

interface TradingState {
  createTrade: (assetId: string, buyerAddress: string, agreedPriceUSD: number) => Promise<{
    success: boolean;
    tradeId: string;
    transactionHash: string;
  }>;
  signTrade: (tradeId: string, totalPaymentUSD: number) => Promise<{
    success: boolean;
    transactionHash: string;
  }>;
  loading: boolean;
}

interface ContractDataState {
  getAsset: (assetId: string) => Promise<{
    companyName: string;
    productName: string;
    category: string;
    surrenderValueUSD: number;
    aiValueUSD: number;
    riskGrade: number;
    status: number;
    owner: string;
  }>;
  getTrade: (tradeId: string) => Promise<{
    assetId: string;
    buyer: string;
    agreedPriceUSD: number;
    status: number;
  }>;
  getUserEscrowBalance: (userAddress: string) => Promise<number>;
  getPlatformStats: () => Promise<{
    totalAssets: number;
    totalTrades: number;
    totalVolumeUSD: number;
  }>;
}

// Web3 훅
export const useWeb3 = (): Web3State => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      
      // 네트워크 확인 및 전환
      const network = await provider.getNetwork();
      if (network.chainId !== 97) { // BSC Testnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x61' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [CONTRACT_CONFIG.NETWORK],
            });
          }
        }
      }

      const contract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        signer
      );

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(accounts[0]);
      setIsConnected(true);
      setNetworkError(null);

      console.log('✅ Web3 연결 완료:', accounts[0]);
    } catch (error) {
      console.error('❌ Web3 연결 실패:', error);
      setNetworkError((error as Error).message);
      throw error;
    }
  };

  const usdToBnb = async (usdAmount: number): Promise<string> => {
    // 간단한 USD to BNB 변환 (실제로는 API 사용)
    const bnbPrice = 300; // USD per BNB (예시)
    const bnbAmount = usdAmount / bnbPrice;
    return ethers.utils.parseEther(bnbAmount.toString()).toString();
  };

  useEffect(() => {
    // 자동 연결 시도
    if (typeof window.ethereum !== 'undefined') {
      connectWallet().catch(console.error);
    }
  }, []);

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    networkError,
    connectWallet,
    usdToBnb
  };
};

// 자산 등록 훅
export const useAssetRegistration = (): AssetRegistrationState => {
  const { contract, signer } = useWeb3();
  const [loading, setLoading] = useState(false);

  const registerAsset = async (assetData: AssetData) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.registerAsset(
        assetData.companyName,
        assetData.productName,
        assetData.category,
        assetData.surrenderValueUSD,
        assetData.contractPeriod,
        assetData.annualPaymentUSD,
        assetData.totalPaymentUSD
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === 'AssetRegistered');
      const assetId = event?.args?.assetId?.toString();

      console.log('✅ 자산 등록 완료:', { assetId, transactionHash: tx.hash });

      return {
        success: true,
        assetId: assetId || '0',
        transactionHash: tx.hash,
        feeTransactionHash: tx.hash
      };
    } catch (error) {
      console.error('❌ 자산 등록 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { registerAsset, loading };
};

// AI 평가 훅
export const useAIEvaluation = (): AIEvaluationState => {
  const { contract, signer } = useWeb3();
  const [loading, setLoading] = useState(false);

  const updateAIEvaluation = async (assetId: string, evaluationData: EvaluationData) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.updateAIEvaluation(
        assetId,
        evaluationData.aiValueUSD,
        evaluationData.riskGrade
      );

      const receipt = await tx.wait();
      console.log('✅ AI 평가 업데이트 완료:', { transactionHash: tx.hash });

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('❌ AI 평가 업데이트 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmPlatformPrice = async (assetId: string, confirmedPriceUSD: number) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.confirmPlatformPrice(assetId, confirmedPriceUSD);
      const receipt = await tx.wait();
      
      console.log('✅ 플랫폼 가격 확인 완료:', { transactionHash: tx.hash });

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('❌ 플랫폼 가격 확인 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateAIEvaluation, confirmPlatformPrice, loading };
};

// 거래 훅
export const useTrading = (): TradingState => {
  const { contract, signer, usdToBnb } = useWeb3();
  const [loading, setLoading] = useState(false);

  const createTrade = async (assetId: string, buyerAddress: string, agreedPriceUSD: number) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.createTrade(assetId, buyerAddress, agreedPriceUSD);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === 'TradeCreated');
      const tradeId = event?.args?.tradeId?.toString();

      console.log('✅ 거래 생성 완료:', { tradeId, transactionHash: tx.hash });

      return {
        success: true,
        tradeId: tradeId || '0',
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('❌ 거래 생성 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signTrade = async (tradeId: string, totalPaymentUSD: number) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const bnbAmount = await usdToBnb(totalPaymentUSD);
      const tx = await contract.signTrade(tradeId, totalPaymentUSD, { value: bnbAmount });
      const receipt = await tx.wait();

      console.log('✅ 거래 서명 완료:', { transactionHash: tx.hash });

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('❌ 거래 서명 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createTrade, signTrade, loading };
};

// 컨트랙트 데이터 훅
export const useContractData = (): ContractDataState => {
  const { contract } = useWeb3();

  const getAsset = async (assetId: string) => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const asset = await contract.getAsset(assetId);
      return {
        companyName: asset.companyName,
        productName: asset.productName,
        category: asset.category,
        surrenderValueUSD: asset.surrenderValueUSD.toNumber(),
        aiValueUSD: asset.aiValueUSD.toNumber(),
        riskGrade: asset.riskGrade,
        status: asset.status,
        owner: asset.owner
      };
    } catch (error) {
      console.error('❌ 자산 조회 실패:', error);
      throw error;
    }
  };

  const getTrade = async (tradeId: string) => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const trade = await contract.getTrade(tradeId);
      return {
        assetId: trade.assetId.toString(),
        buyer: trade.buyer,
        agreedPriceUSD: trade.agreedPriceUSD.toNumber(),
        status: trade.status
      };
    } catch (error) {
      console.error('❌ 거래 조회 실패:', error);
      throw error;
    }
  };

  const getUserEscrowBalance = async (userAddress: string) => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const balance = await contract.getUserEscrowBalance(userAddress);
      return balance.toNumber();
    } catch (error) {
      console.error('❌ 사용자 에스크로 잔액 조회 실패:', error);
      throw error;
    }
  };

  const getPlatformStats = async () => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const stats = await contract.getPlatformStats();
      return {
        totalAssets: stats.totalAssets.toNumber(),
        totalTrades: stats.totalTrades.toNumber(),
        totalVolumeUSD: stats.totalVolumeUSD.toNumber()
      };
    } catch (error) {
      console.error('❌ 플랫폼 통계 조회 실패:', error);
      throw error;
    }
  };

  return { getAsset, getTrade, getUserEscrowBalance, getPlatformStats };
};
