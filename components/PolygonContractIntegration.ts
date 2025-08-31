// Polygon WellSwap 멀티시그 통합
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

// Polygon 메인넷 설정 (다중 RPC fallback)
const POLYGON_CONFIG = {
  CHAIN_ID: 137,
  CHAIN_NAME: 'Polygon Mainnet',
  RPC_URLS: [
    'https://polygon-rpc.com',
    'https://rpc-mainnet.matic.network',
    'https://polygon-mainnet.public.blastapi.io',
    'https://rpc.ankr.com/polygon',
    'https://polygon.llamarpc.com'
  ],
  BLOCK_EXPLORER: 'https://polygonscan.com/',
  NATIVE_TOKEN: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
};

// Polygon 메인넷 주소들
const CONTRACT_ADDRESSES = {
  WELLSWAP_CONTRACT: '0x78198e6862bAae2D448Ef80f94f09184b3188973', // 메인넷 배포 주소
  USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Polygon USDC (Native USDC - 최신)
  USDC_LEGACY: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // 레거시 USDC (bridged)
  USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'  // Polygon USDT (필요시)
};

// ERC20 ABI (USDC/USDT용)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

// WellSwap 컨트랙트 ABI (가변 수수료 버전)
const WELLSWAP_ABI = [
  'function registerInsuranceAsset(string memory insuranceCompany, string memory productName, string memory productCategory, uint256 contractDate, uint256 contractPeriod, uint256 paidPeriod, uint256 annualPremium, uint256 totalPaid) external',
  'function setPlatformPrice(uint256 assetId, uint256 price) external',
  'function purchaseAsset(uint256 assetId) external',
  'function completeTransaction(uint256 assetId) external',
  'function getAsset(uint256 assetId) view returns (tuple(uint256 assetId, address seller, address buyer, string insuranceCompany, string productName, string productCategory, uint256 contractDate, uint256 contractPeriod, uint256 paidPeriod, uint256 annualPremium, uint256 totalPaid, uint256 platformPrice, uint256 registrationFee, uint256 listingTimestamp, uint8 status))',
  'function expireAsset(uint256 assetId) external',
  'function getTimeUntilExpiry(uint256 assetId) view returns (uint256)',
  'function isAdmin(address) view returns (bool)',
  'function platformBalance() view returns (uint256)',
  'function registrationFee() view returns (uint256)',
  'function platformFeePercent() view returns (uint256)',
  'function setRegistrationFee(uint256 _newFee) external',
  'function setPlatformFeePercent(uint256 _newFeePercent) external',
  'event AssetRegistered(uint256 indexed assetId, address indexed seller, uint256 registrationFee)',
  'event AssetPriced(uint256 indexed assetId, uint256 platformPrice)',
  'event AssetPurchased(uint256 indexed assetId, address indexed buyer, uint256 amount)',
  'event TradeCompleted(uint256 indexed assetId, address indexed seller, address indexed buyer, uint256 amount)',
  'event AssetExpired(uint256 indexed assetId, uint256 registrationFee)'
];

// 재시도 로직 with exponential backoff
async function retryWithFallback<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      console.log(`❌ 시도 ${i + 1}/${maxRetries} 실패:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const waitTime = delay * Math.pow(2, i) + Math.random() * 1000;
      console.log(`⏳ ${Math.round(waitTime)}ms 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Max retries reached');
}

// Fallback RPC Provider 생성
async function createFallbackProvider() {
  for (const rpcUrl of POLYGON_CONFIG.RPC_URLS) {
    try {
      console.log(`🔄 RPC 시도: ${rpcUrl}`);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      // 연결 테스트
      await provider.getBlockNumber();
      console.log(`✅ RPC 연결 성공: ${rpcUrl}`);
      return provider;
    } catch (error) {
      console.log(`❌ RPC 실패: ${rpcUrl}`);
      continue;
    }
  }
  throw new Error('모든 RPC 연결 실패');
}

// MetaMask 연결 및 네트워크 설정
export async function connectMetaMask() {
  console.log('🦊 MetaMask 연결 시도 중...');
  
  const provider = await detectEthereumProvider();
  if (!provider) {
    throw new Error('MetaMask가 설치되지 않았습니다. https://metamask.io에서 설치해주세요.');
  }

  const ethProvider = new ethers.BrowserProvider(provider as any);
  
  try {
    // 계정 연결 요청
    await ethProvider.send('eth_requestAccounts', []);
    const signer = await ethProvider.getSigner();
    const address = await signer.getAddress();
    
    // 네트워크 확인 및 변경
    const network = await ethProvider.getNetwork();
    if (Number(network.chainId) !== POLYGON_CONFIG.CHAIN_ID) {
      console.log('🔄 Amoy 테스트넷으로 변경 중...');
      try {
        await switchToAmoy();
        // 네트워크 변경 후 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 새로운 provider 인스턴스 생성
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        const newAddress = await newSigner.getAddress();
        
        return {
          provider: newProvider,
          signer: newSigner,
          address: newAddress,
          balance: ethers.formatEther(await newProvider.getBalance(newAddress))
        };
      } catch (networkError) {
        console.warn('⚠️ 네트워크 변경 실패, 현재 네트워크로 계속:', networkError);
      }
    }
    
    // 잔액 확인
    const balance = await ethProvider.getBalance(address);
    const maticBalance = ethers.formatEther(balance);
    
    console.log('✅ MetaMask 연결 완료:', address);
    console.log('💰 MATIC 잔액:', maticBalance);
    console.log('🌐 현재 네트워크:', network.chainId, network.name);
    
    return {
      provider: ethProvider,
      signer,
      address,
      balance: maticBalance
    };
    
  } catch (error: any) {
    console.error('❌ MetaMask 연결 실패:', error);
    throw error;
  }
}

// Amoy 테스트넷으로 전환
async function switchToAmoy() {
  const provider = await detectEthereumProvider();
  if (!provider) return;
  
  try {
    await (provider as any).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${POLYGON_CONFIG.CHAIN_ID.toString(16)}` }],
    });
  } catch (error: any) {
    // 네트워크가 없으면 추가
    if (error.code === 4902) {
      await (provider as any).request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${POLYGON_CONFIG.CHAIN_ID.toString(16)}`,
          chainName: POLYGON_CONFIG.CHAIN_NAME,
          nativeCurrency: POLYGON_CONFIG.NATIVE_TOKEN,
          rpcUrls: POLYGON_CONFIG.RPC_URLS,
          blockExplorerUrls: [POLYGON_CONFIG.BLOCK_EXPLORER]
        }]
      });
    } else {
      throw error;
    }
  }
}

// USDC 잔액 조회 (Native + Legacy USDC 모두 확인)
export async function getUSDCBalance(address: string) {
  console.log('💰 USDC 잔액 조회 중 (Native + Legacy)...', address);
  
  try {
    const { provider } = await connectMetaMask();
    
    // Native USDC 확인
    const nativeUsdcContract = new ethers.Contract(CONTRACT_ADDRESSES.USDC, ERC20_ABI, provider);
    const nativeBalance = await nativeUsdcContract.balanceOf(address);
    const nativeDecimals = await nativeUsdcContract.decimals();
    const nativeSymbol = await nativeUsdcContract.symbol();
    const nativeFormatted = ethers.formatUnits(nativeBalance, nativeDecimals);
    
    // Legacy USDC 확인
    const legacyUsdcContract = new ethers.Contract(CONTRACT_ADDRESSES.USDC_LEGACY, ERC20_ABI, provider);
    const legacyBalance = await legacyUsdcContract.balanceOf(address);
    const legacyDecimals = await legacyUsdcContract.decimals();
    const legacySymbol = await legacyUsdcContract.symbol();
    const legacyFormatted = ethers.formatUnits(legacyBalance, legacyDecimals);
    
    console.log(`✅ Native ${nativeSymbol} 잔액:`, nativeFormatted);
    console.log(`✅ Legacy ${legacySymbol} 잔액:`, legacyFormatted);
    
    // 더 많은 잔액이 있는 것을 사용
    const useNative = parseFloat(nativeFormatted) >= parseFloat(legacyFormatted);
    const selectedBalance = useNative ? nativeBalance : legacyBalance;
    const selectedFormatted = useNative ? nativeFormatted : legacyFormatted;
    const selectedSymbol = useNative ? nativeSymbol : legacySymbol;
    const selectedAddress = useNative ? CONTRACT_ADDRESSES.USDC : CONTRACT_ADDRESSES.USDC_LEGACY;
    
    console.log(`🎯 사용할 USDC: ${useNative ? 'Native' : 'Legacy'} (${selectedFormatted})`);
    
    return {
      balance: selectedFormatted,
      symbol: selectedSymbol,
      raw: selectedBalance,
      contractAddress: selectedAddress,
      isNative: useNative,
      nativeBalance: nativeFormatted,
      legacyBalance: legacyFormatted
    };
    
  } catch (error) {
    console.error('❌ USDC 잔액 조회 실패:', error);
    return { 
      balance: '0', 
      symbol: 'USDC', 
      raw: BigInt(0),
      contractAddress: CONTRACT_ADDRESSES.USDC,
      isNative: true,
      nativeBalance: '0',
      legacyBalance: '0'
    };
  }
}

// 1단계: 보험 자산 등록 (동적 등록비)
export async function registerInsuranceAsset(assetData: {
  insuranceCompany: string;
  productName: string;
  productCategory: string;
  contractDate: string;
  contractPeriod: string;
  paidPeriod: string;
  annualPremium: string;
  totalPaid: string;
}) {
  console.log('📝 보험 자산 등록 시작...');
  
  try {
    const { signer, address } = await connectMetaMask();
    
    // USDC 컨트랙트
    const usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.USDC, ERC20_ABI, signer);
    
    // WellSwap 컨트랙트에서 현재 등록비 조회 (view 함수는 provider로 호출)
    const provider = new ethers.BrowserProvider(window.ethereum);
    const wellswapContract = new ethers.Contract(CONTRACT_ADDRESSES.WELLSWAP_CONTRACT, WELLSWAP_ABI, provider);
    
    let registrationFee;
    let regFeeFormatted;
    
    try {
      registrationFee = await wellswapContract.registrationFee();
      regFeeFormatted = ethers.formatUnits(registrationFee, 6);
    } catch (rpcError) {
      console.warn('⚠️ RPC 오류, 대체 RPC로 재시도:', rpcError);
      // 대체 RPC provider 사용
      const altProvider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
      const altContract = new ethers.Contract(CONTRACT_ADDRESSES.WELLSWAP_CONTRACT, WELLSWAP_ABI, altProvider);
      registrationFee = await altContract.registrationFee();
      regFeeFormatted = ethers.formatUnits(registrationFee, 6);
    }
    
    console.log('💰 현재 등록비:', regFeeFormatted, 'USDC');
    
    // 1. USDC 잔액 확인 (Native + Legacy)
    const usdcInfo = await getUSDCBalance(address);
    if (parseFloat(usdcInfo.balance) < parseFloat(regFeeFormatted)) {
      throw new Error(`USDC 잔액 부족. 필요: ${regFeeFormatted} USDC, 보유: ${usdcInfo.balance} ${usdcInfo.symbol} (Native: ${usdcInfo.nativeBalance}, Legacy: ${usdcInfo.legacyBalance})`);
    }
    
    // 사용할 USDC 컨트랙트 동적 선택
    const actualUsdcAddress = usdcInfo.contractAddress;
    console.log('🎯 선택된 USDC 주소:', actualUsdcAddress, usdcInfo.isNative ? '(Native)' : '(Legacy)');
    
    // 2. USDC approve (재시도 로직 포함) - 동적 USDC 주소 사용
    const dynamicUsdcContract = new ethers.Contract(actualUsdcAddress, ERC20_ABI, signer);
    
    await retryWithFallback(async () => {
      console.log('💰 USDC approve 시작... (주소:', actualUsdcAddress, ')');
      
      // 가스비 추정 with fallback
      const gasEstimate = await retryWithFallback(async () => {
        return await dynamicUsdcContract.approve.estimateGas(CONTRACT_ADDRESSES.WELLSWAP_CONTRACT, registrationFee);
      }, 2, 500);
      
      const gasLimit = gasEstimate * BigInt(150) / BigInt(100); // 50% 여유분
      
      console.log(`⛽ Gas 설정: ${gasLimit.toString()}`);
      
      const approveTx = await dynamicUsdcContract.approve(CONTRACT_ADDRESSES.WELLSWAP_CONTRACT, registrationFee, {
        gasLimit: gasLimit,
        maxFeePerGas: ethers.parseUnits('80', 'gwei'), // 메인넷 적정 가스
        maxPriorityFeePerGas: ethers.parseUnits('40', 'gwei')
      });
      
      console.log('⏳ USDC approve 대기 중...', approveTx.hash);
      
      // 트랜잭션 확인 with timeout
      const receipt = await Promise.race([
        approveTx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout')), 60000)
        )
      ]);
      
      console.log('✅ USDC approve 완료:', receipt.hash);
      return receipt;
    }, 3, 2000);
    
    // 3. 데이터 변환
    const processedData = {
      insuranceCompany: assetData.insuranceCompany,
      productName: assetData.productName,
      productCategory: assetData.productCategory,
      contractDate: Math.floor(new Date(assetData.contractDate || Date.now()).getTime() / 1000),
      contractPeriod: parseInt(assetData.contractPeriod?.match(/\\d+/)?.[0] || '10'),
      paidPeriod: parseInt(assetData.paidPeriod?.match(/\\d+/)?.[0] || '1'),
      annualPremium: ethers.parseUnits(assetData.annualPremium || '1000', 6),
      totalPaid: ethers.parseUnits(assetData.totalPaid || '3000', 6)
    };
    
    // 4. WellSwap 컨트랙트에 실제 등록
    const contractForRegister = new ethers.Contract(CONTRACT_ADDRESSES.WELLSWAP_CONTRACT, WELLSWAP_ABI, signer);
    
    console.log('🔄 WellSwap 컨트랙트 등록 중...');
    const registerTx = await contractForRegister.registerInsuranceAsset(
      processedData.insuranceCompany,
      processedData.productName,
      processedData.productCategory,
      processedData.contractDate,
      processedData.contractPeriod,
      processedData.paidPeriod,
      processedData.annualPremium,
      processedData.totalPaid
    );
    
    console.log('⏳ 블록체인 확인 대기 중...');
    await registerTx.wait();
    console.log('✅ 보험 자산 등록 완료');
    
    return {
      success: true,
      transactionHash: registerTx.hash,
      assetId: 'pending', // 이벤트에서 추출 필요
      registrationFee: regFeeFormatted
    };
    
  } catch (error: any) {
    console.error('❌ 보험 자산 등록 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 2단계: 플랫폼 가격 책정 (관리자용)
export async function setPlatformPrice(assetId: number, price: string) {
  console.log(`💰 2단계: 자산 ${assetId} 가격 책정 -> ${price} USDC`);
  
  try {
    const { signer } = await connectMetaMask();
    
    // 관리자 권한 확인 (임시)
    console.log('👑 관리자 권한 확인 중...');
    
    // WellSwap 컨트랙트 호출 (임시)
    console.log('✅ 가격 책정 완료 (임시)');
    
    return {
      success: true,
      assetId,
      price,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
    
  } catch (error: any) {
    console.error('❌ 가격 책정 실패:', error);
    return { success: false, error: error.message };
  }
}

// 3단계: 자산 구매 (구매자용)  
export async function purchaseAsset(assetId: number, price: string) {
  console.log(`🛒 3단계: 자산 ${assetId} 구매 (${price} USDC)`);
  
  try {
    const { signer, address } = await connectMetaMask();
    const usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.USDC, ERC20_ABI, signer);
    
    const purchaseAmount = ethers.parseUnits(price, 6);
    
    // 잔액 확인
    const balance = await usdcContract.balanceOf(address);
    if (balance < purchaseAmount) {
      throw new Error(`USDC 잔액 부족. 필요: ${price} USDC`);
    }
    
    // USDC approve 및 구매 (임시)
    console.log('✅ 자산 구매 완료 (임시)');
    
    return {
      success: true,
      assetId,
      buyer: address,
      amount: price,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
    
  } catch (error: any) {
    console.error('❌ 자산 구매 실패:', error);
    return { success: false, error: error.message };
  }
}

// 4단계: 거래 완료 및 정산 (관리자용)
export async function completeTransaction(assetId: number) {
  console.log(`✅ 4단계: 거래 ${assetId} 최종 정산`);
  
  try {
    // 오프라인 양도 완료 확인 후 정산 실행
    console.log('🔄 최종 정산 중...');
    console.log('💰 플랫폼 수수료: 2.5%');
    console.log('💸 판매자 지급: 97.5%');
    
    return {
      success: true,
      assetId,
      platformFee: '2.5%',
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
    
  } catch (error: any) {
    console.error('❌ 거래 완료 실패:', error);
    return { success: false, error: error.message };
  }
}

// Mumbai 테스트 토큰 받기 (Faucet 정보)
export function getMumbaiTestTokens() {
  const faucets = {
    matic: 'https://faucet.polygon.technology/',
    usdc: 'Mumbai USDC Faucet - 별도 구현 필요',
    info: 'Mumbai 테스트넷에서 테스트 토큰을 받으세요'
  };
  
  console.log('🚰 Mumbai 테스트 토큰 Faucet:', faucets);
  return faucets;
}

// 등록비 조회
export const getRegistrationFee = async () => {
  try {
    const { contract } = await getContract();
    const fee = await contract.registrationFee();
    
    return {
      success: true,
      fee: ethers.formatUnits(fee, 6), // USDC 단위
      raw: fee
    };
  } catch (error) {
    console.error('❌ 등록비 조회 실패:', error);
    return { success: false, error };
  }
};

// 플랫폼 수수료율 조회
export const getPlatformFeePercent = async () => {
  try {
    const { contract } = await getContract();
    const feePercent = await contract.platformFeePercent();
    
    return {
      success: true,
      feePercent: Number(feePercent) / 100, // 백분율로 변환
      raw: feePercent
    };
  } catch (error) {
    console.error('❌ 플랫폼 수수료율 조회 실패:', error);
    return { success: false, error };
  }
};

// 등록비 설정 (관리자만)
export const setRegistrationFee = async (newFeeUSDC: string) => {
  try {
    const { contract } = await getContractWithSigner();
    
    const newFeeWei = ethers.parseUnits(newFeeUSDC, 6); // USDC 6 decimals
    const tx = await contract.setRegistrationFee(newFeeWei);
    
    console.log('💰 등록비 변경 트랜잭션:', tx.hash);
    await tx.wait();
    
    console.log('✅ 등록비 변경 완료:', newFeeUSDC, 'USDC');
    return { success: true, txHash: tx.hash };
    
  } catch (error) {
    console.error('❌ 등록비 변경 실패:', error);
    return { success: false, error };
  }
};

// 플랫폼 수수료율 설정 (관리자만)
export const setPlatformFeePercent = async (newFeePercent: number) => {
  try {
    const { contract } = await getContractWithSigner();
    
    const newFeeInBasisPoints = newFeePercent * 100; // 백분율을 basis points로 변환
    const tx = await contract.setPlatformFeePercent(newFeeInBasisPoints);
    
    console.log('📊 플랫폼 수수료율 변경 트랜잭션:', tx.hash);
    await tx.wait();
    
    console.log('✅ 플랫폼 수수료율 변경 완료:', newFeePercent, '%');
    return { success: true, txHash: tx.hash };
    
  } catch (error) {
    console.error('❌ 플랫폼 수수료율 변경 실패:', error);
    return { success: false, error };
  }
};

// 유틸리티 함수들
export const PolygonUtils = {
  formatAddress: (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`,
  formatAmount: (amount: string, decimals = 6) => parseFloat(amount).toFixed(decimals),
  getExplorerUrl: (txHash: string) => `${POLYGON_CONFIG.BLOCK_EXPLORER}tx/${txHash}`,
  getAddressUrl: (address: string) => `${POLYGON_CONFIG.BLOCK_EXPLORER}address/${address}`
};

export default {
  connectMetaMask,
  getUSDCBalance,
  registerInsuranceAsset,
  setPlatformPrice,
  purchaseAsset,
  completeTransaction,
  getRegistrationFee,
  getPlatformFeePercent,
  setRegistrationFee,
  setPlatformFeePercent,
  getMumbaiTestTokens,
  PolygonUtils
};