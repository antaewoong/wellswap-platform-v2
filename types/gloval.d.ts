// Window Web3 확장
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (accounts: string[]) => void) => void;
    removeAllListeners: (event: string) => void;
    removeListener: (event: string, callback: (accounts: string[]) => void) => void;
  };
  fs?: {
    readFile: (path: string, options?: { encoding?: string }) => Promise<Uint8Array | string>;
  };
}

// WellSwap 전용 타입들
interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
}

interface ListingItem {
  id: string | number;
  company: string;
  productName: string;
  category: string;
  surrenderValue: number;
  transferValue: number;
  platformPrice: number;
  confidence: number;
  riskGrade: string;
  contractPeriod: string;
  paidPeriod: string;
  annualPayment: number;
  status: 'available' | 'pending' | 'sold' | 'blockchain_pending';
  seller: string;
  listingDate: string;
  blockchainAssetId?: string;
  multisigStage?: number;
  registrationTxHash?: string;
  feeTxHash?: string;
}

interface InsuranceData {
  company: string;
  productCategory: string;
  productName: string;
  startDate: string;
  contractPeriod: string;
  actualPaymentPeriod: string;
  annualPayment: string;
  totalPayment: string;
  customContractPeriod: string;
}

interface TradeSteps {
  stage: number;
  currentAssetId: string | null;
  currentTradeId: string | null;
  escrowBalances: Record<string, string>;
}

interface AutoRefundStatus {
  eligibleAssets: any[];
  processing: boolean;
  lastCheck: Date | null;
}

interface PlatformStats {
  totalVolume: number;
  activeUsers: number;
  successRate: number;
  totalListings: number;
  completedTransactions: number;
}

interface User {
  email: string;
  role: string;
}

// Supabase 관련 타입
interface SupabaseAsset {
  id: string;
  owner_address: string;
  company_name: string;
  product_name: string;
  product_category: string;
  policy_number: string;
  contract_date: string;
  contract_period_years: number;
  paid_period_years: number;
  annual_premium: number;
  total_paid: number;
  currency: string;
  asking_price: number;
  status: string;
  blockchain_asset_id?: string;
  registration_tx_hash?: string;
  fee_tx_hash?: string;
  multisig_stage?: number;
  auto_refund_processed?: boolean;
  auto_refund_tx_hash?: string;
  auto_refund_processed_at?: string;
  auto_refund_processed_by?: string;
  auto_refund_days_elapsed?: number;
  created_at: string;
  updated_at: string;
}