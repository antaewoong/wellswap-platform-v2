// components/ContractIntegration.ts
// 🔗 WellSwap 4단계 멀티시그 거래 시스템 완전 연동

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

// 🏗️ 완전한 컨트랙트 설정 정보
import { WELLSWAP_ABI, WELLSWAP_CONTRACT_ADDRESS } from '../lib/contracts/wellswap-abi';

// ★ 새로 추가: 언제 호출해도 살아있는 provider/signer/contract 보장
async function ensureWritableContract() {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error('MetaMask가 필요합니다.');

  // HMR에도 안전한 provider (ethers v6)
  const provider = new ethers.BrowserProvider(eth);

  // 계정 보장 (이미 연결돼 있으면 no-op)
  try { await provider.send('eth_requestAccounts', []); } catch {}

  // 체인 보장: BSC Testnet(0x61 / 97)
  let { chainId } = await provider.getNetwork();
  if (chainId !== 97) {
    await provider.send('wallet_switchEthereumChain', [{ chainId: '0x61' }]);
    ({ chainId } = await provider.getNetwork());
  }

  const signer = provider.getSigner();

  // 주소/ABI는 기존 단일 소스만 사용
  const address =
    (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '').trim() ||
    (typeof WELLSWAP_CONTRACT_ADDRESS !== 'undefined' ? WELLSWAP_CONTRACT_ADDRESS : '');

  if (!address) throw new Error('컨트랙트 주소가 설정되어 있지 않습니다.');

  // 진짜 배포 확인 (주소만 있고 배포 안 돼 있으면 0x)
  const code = await provider.getCode(address);
  if (!code || code === '0x') {
    throw new Error(`체인 ${chainId}에서 ${address} 에 컨트랙트 코드가 없습니다.`);
  }

  const contract = new ethers.Contract(address, WELLSWAP_ABI, signer);
  return { provider, signer, contract, address, chainId };
}

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
  CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || WELLSWAP_CONTRACT_ADDRESS,
  
  // 완전한 WellSwap 컨트랙트 ABI (단일 소스)
  CONTRACT_ABI: WELLSWAP_ABI
};

// 🏦 BNB 가격 관리 시스템
interface BNBPriceData {
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  priceChangePercent: number;
  lastUpdated: Date;
}

class BNBPriceManager {
  private static instance: BNBPriceManager;
  private currentPriceData: BNBPriceData | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 30000; // 30초 캐시

  static getInstance(): BNBPriceManager {
    if (!BNBPriceManager.instance) {
      BNBPriceManager.instance = new BNBPriceManager();
    }
    return BNBPriceManager.instance;
  }

  // 🚀 바이낸스 API에서 BNB 가격 데이터 가져오기
  async fetchBNBPriceData(): Promise<BNBPriceData> {
    const now = Date.now();
    
    // 캐시된 데이터가 있고 30초 이내라면 캐시 사용
    if (this.currentPriceData && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      console.log('📊 BNB 가격 캐시 사용:', this.currentPriceData.currentPrice);
      return this.currentPriceData;
    }

    try {
      console.log('🔄 BNB 가격 데이터 새로 가져오는 중...');
      
      // 1. 현재 가격 가져오기 (CoinGecko API)
      const currentResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_24hr_change=true');
      const currentData = await currentResponse.json();
      
      if (!currentData.binancecoin) {
        throw new Error('BNB 가격 데이터를 가져올 수 없습니다.');
      }

      const currentPrice = currentData.binancecoin.usd;
      const priceChangePercent = currentData.binancecoin.usd_24h_change || 0;
      
      // 2. 전일 종가 계산 (24시간 변화율로부터)
      const previousClose = currentPrice / (1 + (priceChangePercent / 100));
      const priceChange = currentPrice - previousClose;

      // 3. 낮은 가격 선택 (현재가 vs 전일종가)
      const finalPrice = Math.min(currentPrice, previousClose);
      
      this.currentPriceData = {
        currentPrice: finalPrice,
        previousClose,
        priceChange,
        priceChangePercent,
        lastUpdated: new Date()
      };
      
      this.lastFetchTime = now;
      
      console.log('✅ BNB 가격 업데이트 완료:', {
        currentPrice: currentPrice,
        previousClose: previousClose,
        finalPrice: finalPrice,
        priceChange: priceChange,
        priceChangePercent: priceChangePercent
      });
      
      return this.currentPriceData;
      
    } catch (error) {
      console.error('❌ BNB 가격 가져오기 실패:', error);
      
      // 에러 시 기본값 반환 (안전한 가격)
      const fallbackPrice = 300; // 안전한 기본값
      this.currentPriceData = {
        currentPrice: fallbackPrice,
        previousClose: fallbackPrice,
        priceChange: 0,
        priceChangePercent: 0,
        lastUpdated: new Date()
      };
      
      return this.currentPriceData;
    }
  }

  // 💰 현재 BNB 가격 반환 (낮은 가격 우선)
  async getCurrentBNBPrice(): Promise<number> {
    const priceData = await this.fetchBNBPriceData();
    return priceData.currentPrice;
  }

  // 📈 가격 변화 정보 반환
  async getPriceChangeInfo(): Promise<{ change: number; changePercent: number }> {
    const priceData = await this.fetchBNBPriceData();
    return {
      change: priceData.priceChange,
      changePercent: priceData.priceChangePercent
    };
  }
}

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
  connectWallet: () => Promise<string>;
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
  signTrade: (tradeId: string) => Promise<{
    success: boolean;
    transactionHash: string;
  }>;
  executeTrade: (tradeId: string) => Promise<{
    success: boolean;
    transactionHash: string;
  }>;
  getMultisigStatus: (tradeId: string) => Promise<{
    currentSignatures: number;
    requiredSignatures: number;
    isExecuted: boolean;
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

  const connectWallet = async (): Promise<string> => {  // 반환 타입 명시
    try {
      console.log('🔗 지갑 연결 시작...');
      
      const eth = (window as any).ethereum;
      if (!eth) {
        throw new Error('MetaMask가 설치되지 않았습니다');
      }

      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      
      if (!accounts?.[0]) {
        throw new Error('계정을 선택해주세요');
      }

      const provider = new ethers.providers.Web3Provider(eth);
      
      // 체인 확인 및 스위치 (기존 로직 유지)
      const currentChainId = await eth.request({ method: 'eth_chainId' });
      if (currentChainId !== CONTRACT_CONFIG.NETWORK.chainId) { // CHAIN_ID 대신 CONTRACT_CONFIG.NETWORK.chainId 사용
        try {
          await eth.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONTRACT_CONFIG.NETWORK.chainId }], // CHAIN_ID 대신 CONTRACT_CONFIG.NETWORK.chainId 사용
          });
        } catch (switchError: any) {
          throw new Error('올바른 네트워크로 전환해주세요');
        }
      }

      // 컨트랙트 검증 (기존 로직 유지)
      if (!CONTRACT_CONFIG.CONTRACT_ADDRESS || !ethers.utils.isAddress(CONTRACT_CONFIG.CONTRACT_ADDRESS)) {
        throw new Error('컨트랙트 주소가 올바르지 않습니다');
      }
      
      const code = await provider.getCode(CONTRACT_CONFIG.CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error('현재 체인에 컨트랙트가 없습니다');
      }

      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_CONFIG.CONTRACT_ADDRESS, CONTRACT_CONFIG.CONTRACT_ABI, signer);

      // 상태 업데이트 (기존 로직 유지)
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(accounts[0]);
      setIsConnected(true);
      setNetworkError(null);

      console.log('✅ 지갑 연결 완료:', accounts[0]);
      
      // 연결된 주소 반환 (이 부분이 핵심 수정사항)
      return accounts[0];
    } catch (error: any) {
      console.error('❌ 지갑 연결 실패:', error);
      setNetworkError(error.message);
      setIsConnected(false);
      throw error;
    }
  };

  // 기존 usdToBnb 함수 유지
  const usdToBnb = async (usdAmount: number): Promise<string> => {
  if (!usdAmount || usdAmount <= 0) throw new Error('USD amount must be positive');

  // ---- Binance REST (primary) ----
  const parsePriceToInt = (priceStr: string) => {
    const [ip, fp=''] = priceStr.split('.');
    const decimals = fp.length;
    const intStr = (ip + fp).replace(/^0+(?=\d)/, '') || '0';
    return { priceInt: ethers.BigNumber.from(intStr), decimals };
  };

  const tryBinance = async () => {
    const url = process.env.NEXT_PUBLIC_BINANCE_PRICE_URL || 'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT';
    const res = await fetch(url, { cache: 'no-store', headers: { 'accept': 'application/json' } } as RequestInit);
    if (!res.ok) throw new Error('Binance HTTP ' + res.status);
    const json = await res.json() as any;
    const priceStr = (json.price ?? json.lastPrice ?? '').toString();
    if (!priceStr) throw new Error('Binance response missing price');
    const { priceInt, decimals } = parsePriceToInt(priceStr);
    if (priceInt.lte(0)) throw new Error('Binance invalid price');
    return { priceInt, decimals };
  };

  const tryChainlink = async () => {
    const feedAddr = (process.env.NEXT_PUBLIC_CHAINLINK_BNB_USD_FEED || '').trim();
    if (!feedAddr) throw new Error('Missing NEXT_PUBLIC_CHAINLINK_BNB_USD_FEED');
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const AGGREGATOR_V3_ABI = [
      {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"latestRoundData","outputs":[
        {"internalType":"uint80","name":"roundId","type":"uint80"},
        {"internalType":"int256","name":"answer","type":"int256"},
        {"internalType":"uint256","name":"startedAt","type":"uint256"},
        {"internalType":"uint256","name":"updatedAt","type":"uint256"},
        {"internalType":"uint80","name":"answeredInRound","type":"uint80"}
      ],"stateMutability":"view","type":"function"}
    ] as const;
    const feed = new ethers.Contract(feedAddr, AGGREGATOR_V3_ABI, provider);
    const [latest, decimals] = await Promise.all([feed.latestRoundData(), feed.decimals()]);
    const priceInt = ethers.BigNumber.from(latest.answer.toString());
    return { priceInt, decimals: Number(decimals) };
  };

  let priceInt: any, decimals: number;
  try {
    const out = await tryBinance();
    priceInt = out.priceInt; decimals = out.decimals;
  } catch (e) {
    console.warn('Binance price failed, fallback to Chainlink:', e);
    const out = await tryChainlink();
    priceInt = out.priceInt; decimals = out.decimals;
  }

  // USD → BNB → wei : wei = usdCents * 10^decimals * 1e18 / (priceInt * 100)
  const usdCents = Math.round(usdAmount * 100);
  const numerator = ethers.BigNumber.from(usdCents)
    .mul(ethers.BigNumber.from(10).pow(decimals))
    .mul(ethers.BigNumber.from('1000000000000000000'));
  const denominator = priceInt.mul(100);
  const wei = numerator.div(denominator);
  if (wei.lte(0)) throw new Error('Computed wei is zero');
  return wei.toString();
};

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

// 실제 쓰기 가능한 컨트랙트 인스턴스 생성
export async function getWritableContract() {
  console.log('🔍 getWritableContract 시작...');
  
  const eth = (window as any).ethereum;
  if (!eth) {
    console.error('❌ MetaMask가 설치되지 않았습니다');
    throw new Error('지갑이 없습니다');
  }
  
  console.log('✅ MetaMask 감지됨');
  
  // 사용자 지갑 기반 프로바이더(서명용) - ethers v5 문법
  const provider = new ethers.providers.Web3Provider(eth);
  console.log('✅ Web3Provider 생성됨');

  // 체인 일치 보장
  console.log('🌐 체인 확인 중...');
  const cur = await eth.request({ method: 'eth_chainId' });
  console.log('현재 체인:', cur, '목표 체인:', CONTRACT_CONFIG.NETWORK.chainId);
  
  if (cur !== CONTRACT_CONFIG.NETWORK.chainId) {
    console.log('🔄 체인 스위치 중...');
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONTRACT_CONFIG.NETWORK.chainId }],
      });
      console.log('✅ 체인 스위치 완료');
    } catch (switchError: any) {
      console.warn('⚠️ 체인 스위치 실패:', switchError.message);
      throw new Error('올바른 네트워크로 전환해주세요');
    }
  }

  // 컨트랙트 주소 검증
  if (!CONTRACT_CONFIG.CONTRACT_ADDRESS || !ethers.utils.isAddress(CONTRACT_CONFIG.CONTRACT_ADDRESS)) {
    console.error('❌ 컨트랙트 주소가 올바르지 않습니다:', CONTRACT_CONFIG.CONTRACT_ADDRESS);
    throw new Error('컨트랙트 주소가 올바르지 않습니다');
  }
  
  console.log('✅ 컨트랙트 주소 확인됨:', CONTRACT_CONFIG.CONTRACT_ADDRESS);
  
  // 같은 체인에서 "실제로 배포되어 있는지" 확인
  console.log('🔍 컨트랙트 배포 확인 중...');
  const code = await provider.getCode(CONTRACT_CONFIG.CONTRACT_ADDRESS);
  console.log('📄 컨트랙트 코드:', code.substring(0, 20) + '...');
  
  if (code === '0x') {
    console.error('❌ 현재 체인에 컨트랙트가 없습니다');
    throw new Error('현재 체인에 컨트랙트가 없습니다');
  }

  console.log('✅ 컨트랙트 배포 확인됨');

  // 서명자 생성
  const signer = provider.getSigner();
  console.log('✅ Signer 생성됨');
  
  // 컨트랙트 인스턴스 생성
  const contract = new ethers.Contract(CONTRACT_CONFIG.CONTRACT_ADDRESS, CONTRACT_CONFIG.CONTRACT_ABI, signer);
  console.log('✅ 컨트랙트 인스턴스 생성됨');
  
  return contract;
}

// 자산 등록 함수 (createMultisigTrade 사용)
export async function registerAsset(assetId: number, agreedPriceWei: string) {
  // ✅ 여기부터 교체
  const { provider, signer, contract, address, chainId } = await ensureWritableContract();

  // 타입 정리 (컨트랙트가 uint256 기대 시 안전)
  const idBN   = ethers.BigNumber.from(assetId);
  const valueBN= ethers.BigNumber.from(agreedPriceWei);

  // 가스 추정 + 프리체크 (부족하면 팝업 전에 친절 안내)
  let gasEstimate: ethers.BigNumber;
  try {
    gasEstimate = await contract.estimateGas.createMultisigTrade(idBN, valueBN);
  } catch {
    gasEstimate = ethers.BigNumber.from('500000');
  }
  const feeData  = await provider.getFeeData();
  const gasPrice = feeData.gasPrice ?? ethers.utils.parseUnits('1', 'gwei');
  const gasLimit = gasEstimate.mul(120).div(100); // +20% 버퍼
  const need     = valueBN.add(gasPrice.mul(gasLimit));
  const bal      = await signer.getBalance();
  if (bal.lt(need)) {
    const fmt = (bn:any)=>Number(ethers.utils.formatEther(bn)).toFixed(6);
    throw new Error(`잔액 부족: 필요 ${fmt(need)} tBNB (등록비 ${fmt(valueBN)} + 가스 ${fmt(gasPrice.mul(gasLimit))}), 보유 ${fmt(bal)} tBNB`);
  }

  // 실제 호출 (기존 로직 유지)
  const tx = await contract.createMultisigTrade(idBN, valueBN, {
    value: valueBN,
    gasLimit,
    gasPrice, // 선택
  });
  const receipt = await tx.wait();
  return { success: true, transactionHash: tx.hash, receipt };
}

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
        feeTransactionHash: tx.hash // 수수료 트랜잭션 해시 (동일한 트랜잭션)
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

  const signTrade = async (tradeId: string) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      console.log('🔍 signTrade 호출:', { tradeId });
      const tx = await contract.signTrade(tradeId); // ✅ 단일 인자, nonpayable
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

  const executeTrade = async (tradeId: string) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      console.log('🔍 executeTrade 호출:', { tradeId });
      const tx = await contract.executeTrade(tradeId);
      const receipt = await tx.wait();

      console.log('✅ 거래 실행 완료:', { transactionHash: tx.hash });

      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('❌ 거래 실행 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMultisigStatus = async (tradeId: string) => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      console.log('🔍 getMultisigStatus 호출:', { tradeId });
      const status = await contract.getMultisigStatus(tradeId);
      return {
        currentSignatures: status.currentSignatures.toNumber(),
        requiredSignatures: status.requiredSignatures.toNumber(),
        isExecuted: status.isExecuted
      };
    } catch (error) {
      console.error('❌ 멀티시그 상태 조회 실패:', error);
      throw error;
    }
  };

  return { createTrade, signTrade, executeTrade, getMultisigStatus, loading };
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
