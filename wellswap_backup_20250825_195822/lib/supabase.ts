// lib/supabase.ts - Complete WellSwap Supabase Configuration
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 관리자 지갑 주소 목록 - 귀하의 실제 지갑 주소
export const ADMIN_WALLETS = [
  '0x02756b93394d0bD27aE81C1E5a6e1d55D0B608FE', // 안태웅님 관리자 지갑
  '0x742d35Cc6634C0532925a3b8c0C9e51C93093c67', // 스마트 컨트랙트 주소
  // 추가 관리자 지갑 주소들 (필요시 여기에 추가)
]

// 사용자 권한 확인
export const checkUserRole = (walletAddress: string): 'admin' | 'user' => {
  if (!walletAddress) return 'user'
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase()) ? 'admin' : 'user'
}

// 홍콩 주요 보험사 목록 (30위까지)
export const HONG_KONG_INSURERS = [
  'AIA Hong Kong',
  'Prudential Hong Kong', 
  'Great Eastern Life',
  'FWD Insurance',
  'Sun Life Hong Kong',
  'Manulife Hong Kong',
  'Zurich Insurance',
  'Generali Hong Kong',
  'HSBC Life',
  'Standard Chartered Insurance',
  'China Life Insurance',
  'Ping An Insurance',
  'CPIC Life Insurance',
  'New China Life',
  'China Taiping Life',
  'BOC Life',
  'Bank of China Group Insurance',
  'ICBC-AXA Life',
  'CCB Life',
  'CMB Life Insurance',
  'Hang Seng Insurance',
  'DBS Insurance',
  'Citibank Life',
  'American International Assurance',
  'MetLife Hong Kong',
  'Allianz Hong Kong',
  'Aviva Hong Kong',
  'QBE Hong Kong',
  'Liberty Insurance',
  'Chubb Insurance'
]

// 보험 상품 유형
export const INSURANCE_PRODUCT_TYPES = [
  'Life Insurance',
  'Whole Life Insurance', 
  'Term Life Insurance',
  'Universal Life Insurance',
  'Endowment Insurance',
  'Savings Insurance',
  'Investment Linked Insurance',
  'Annuity',
  'Medical Insurance',
  'Critical Illness Insurance',
  'Disability Insurance',
  'Travel Insurance'
]

// 통화 목록
export const SUPPORTED_CURRENCIES = [
  'USD', 'HKD', 'SGD', 'CNY', 'KRW', 'JPY', 'EUR', 'GBP'
]

// 지역 목록
export const SUPPORTED_LOCATIONS = [
  'Hong Kong', 'Singapore', 'Korea', 'Malaysia', 'Japan', 'Taiwan', 'China', 'Other'
]

// 위험도 레벨
export const RISK_LEVELS = ['Low', 'Medium', 'High'] as const

// 플랫폼 설정
export const PLATFORM_CONFIG = {
  REGISTRATION_FEE_USD: 300,
  PLATFORM_FEE_PERCENT: 2.5,
  MIN_TRADE_AMOUNT: 1000,
  MAX_TRADE_AMOUNT: 1000000,
  AI_CONFIDENCE_THRESHOLD: 0.85,
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
}

// 블록체인 설정
export const BSC_MAINNET = {
  chainId: '0x38',
  chainName: 'BNB Smart Chain',
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  blockExplorerUrls: ['https://bscscan.com/']
}

export const BSC_TESTNET = {
  chainId: '0x61',
  chainName: 'BNB Smart Chain Testnet',
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  blockExplorerUrls: ['https://testnet.bscscan.com/']
}

// AI 서버 설정
export const AI_SERVER_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_AI_SERVER_URL || 'https://wellswaphk.onrender.com',
  ENDPOINTS: {
    ANALYZE: '/analyze',
    OCR: '/ocr',
    VALUATION: '/valuation',
    HONG_KONG_IA_DATA: '/hong-kong-ia-data'
  },
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3
}

// 스마트 컨트랙트 설정
export const CONTRACT_CONFIG = {
  ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x742d35Cc6634C0532925a3b8c0C9e51C93093c67',
  ABI: [
    // 주요 함수들만 포함 (전체 ABI는 별도 파일로 관리)
    'function createTransaction(address seller, string memory policyId) external payable',
    'function signTransaction(bytes32 txId) external',
    'function executeTransaction(bytes32 txId) external',
    'function getTransactionDetails(bytes32 txId) external view returns (address, address, uint256, bool)',
    'function updateAIEvaluation(bytes32 txId, uint256 valuation) external',
    'event TransactionCreated(bytes32 indexed txId, address indexed buyer, address indexed seller)',
    'event TransactionSigned(bytes32 indexed txId, address indexed signer)',
    'event TransactionExecuted(bytes32 indexed txId)'
  ]
}

// 유틸리티 함수들
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export const generatePolicyId = (): string => {
  return 'POL-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const calculateBNBFromUSD = (usdAmount: number, bnbPrice: number): number => {
  if (bnbPrice <= 0) return 0
  return usdAmount / bnbPrice
}

export const validateFileType = (file: File): boolean => {
  return PLATFORM_CONFIG.SUPPORTED_FILE_TYPES.includes(file.type)
}

export const validateFileSize = (file: File): boolean => {
  return file.size <= (PLATFORM_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024)
}

// 에러 타입
export class WellSwapError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'WellSwapError'
  }
}

// API 응답 타입
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// OCR 응답 타입
export interface OCRResult {
  text: string
  confidence: number
  company?: string
  productName?: string
  policyNumber?: string
  originalValue?: number
  purchaseDate?: string
  maturityDate?: string
}

// AI 분석 응답 타입
export interface AIAnalysisResult {
  surrenderValue: number
  marketPremium: number
  timeValue: number
  companyAdjustment: number
  riskLevel: string
  confidenceScore: number
  finalValuation: number
  recommendedPrice: number
  analysisData: any
  hongKongIAData: any
}

// 거래 상태 타입
export type TransactionStatus = 'pending' | 'escrow' | 'completed' | 'cancelled' | 'disputed'
export type ProductStatus = 'draft' | 'analyzing' | 'listed' | 'sold' | 'withdrawn'
export type KYCStatus = 'pending' | 'verified' | 'rejected'

// 알림 타입
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

// 환경별 설정
export const getEnvironmentConfig = () => {
  const isDev = process.env.NODE_ENV === 'development'
  
  return {
    isDev,
    supabaseUrl: isDev ? supabaseUrl : supabaseUrl,
    contractAddress: isDev ? '0x...testnet...' : CONTRACT_CONFIG.ADDRESS,
    network: isDev ? BSC_TESTNET : BSC_MAINNET,
    aiServerUrl: AI_SERVER_CONFIG.BASE_URL
  }
}

// 로깅 유틸리티
export const log = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WellSwap] ${message}`, data)
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[WellSwap Error] ${message}`, error)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WellSwap Warning] ${message}`, data)
  }
}

// 기본 내보내기
export default supabase
