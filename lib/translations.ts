export type Language = 'en' | 'ko' | 'zh' | 'ja';

export interface Translations {
  // Navigation
  sell: string;
  buy: string;
  inquiry: string;
  
  // Common
  wallet: string;
  connectWallet: string;
  walletNotConnected: string;
  
  // Authentication
  multisigAuthRequired: string;
  multisigAuthComplete: string;
  multisigConnecting: string;
  perfectMultisigAuthRequired: string;
  step1MultisigRegistration: string;
  
  // Insurance
  selectInsuranceCompany: string;
  selectProductCategory: string;
  selectContractPeriod: string;
  selectPaidPeriod: string;
  contractPeriod: string;
  paymentPeriod: string;
  annualPremium: string;
  surrenderValue: string;
  transferValue: string;
  platformPrice: string;
  confidence: string;
  riskGrade: string;
  
  // Status
  available: string;
  pending: string;
  sold: string;
  processing: string;
  
  // Actions
  purchase: string;
  purchaseWithMultisig: string;
  connectWalletToPurchase: string;
  inquireNow: string;
  submitInquiry: string;
  submitting: string;
  
  // Concierge
  professionalConciergeService: string;
  inquiryForm: string;
  name: string;
  phone: string;
  email: string;
  inquiryDetails: string;
  contactInformation: string;
  
  // Footer
  footerCopyright: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    sell: 'Sell Insurance',
    buy: 'Buy Insurance',
    inquiry: 'Concierge',
    
    // Common
    wallet: 'Connect Wallet',
    connectWallet: 'Connect Wallet',
    walletNotConnected: 'Wallet not connected',
    
    // Authentication
    multisigAuthRequired: 'Multisig Authentication Required',
    multisigAuthComplete: 'Multisig Authentication Complete',
    multisigConnecting: 'Connecting Multisig...',
    perfectMultisigAuthRequired: 'Perfect Multisig Authentication Required',
    step1MultisigRegistration: 'Step 1: Multisig Registration (300 USD)',
    
    // Insurance
    selectInsuranceCompany: 'Select Insurance Company',
    selectProductCategory: 'Select Product Category',
    selectContractPeriod: 'Select Contract Period',
    selectPaidPeriod: 'Select Paid Period',
    contractPeriod: 'Contract Period',
    paymentPeriod: 'Payment Period',
    annualPremium: 'Annual Premium',
    surrenderValue: 'Surrender Value',
    transferValue: 'Transfer Value',
    platformPrice: 'Platform Price',
    confidence: 'AI Confidence',
    riskGrade: 'Risk Grade',
    
    // Status
    available: 'Available',
    pending: 'Pending',
    sold: 'Sold',
    processing: 'Processing...',
    
    // Actions
    purchase: 'Purchase',
    purchaseWithMultisig: 'Purchase with Multisig',
    connectWalletToPurchase: 'Connect Wallet to Purchase',
    inquireNow: 'Inquire Now',
    submitInquiry: 'Submit Inquiry',
    submitting: 'Submitting...',
    
    // Concierge
    professionalConciergeService: 'Professional Concierge Service',
    inquiryForm: 'Inquiry Form',
    name: 'Name *',
    phone: 'Phone *',
    email: 'Email',
    inquiryDetails: 'Inquiry Details *',
    contactInformation: 'Contact Information',
    
    // Footer
    footerCopyright: '© 2025 WellSwap. Global Insurance Transfer Platform.',
  },
  
  ko: {
    // Navigation
    sell: '보험 판매',
    buy: '보험 구매',
    inquiry: '컨시어지',
    
    // Common
    wallet: '지갑 연결',
    connectWallet: '지갑 연결',
    walletNotConnected: '지갑이 연결되지 않음',
    
    // Authentication
    multisigAuthRequired: '멀티시그 인증 필요',
    multisigAuthComplete: '멀티시그 인증 완료',
    multisigConnecting: '멀티시그 연결 중...',
    perfectMultisigAuthRequired: '완벽한 멀티시그 인증 필요',
    step1MultisigRegistration: '1단계: 멀티시그 등록 (300 USD)',
    
    // Insurance
    selectInsuranceCompany: '보험사 선택',
    selectProductCategory: '상품 카테고리 선택',
    selectContractPeriod: '계약 기간 선택',
    selectPaidPeriod: '납입 기간 선택',
    contractPeriod: '계약 기간',
    paymentPeriod: '납입 기간',
    annualPremium: '연간 보험료',
    surrenderValue: '해지환급금',
    transferValue: '양도가치',
    platformPrice: '플랫폼 가격',
    confidence: 'AI 신뢰도',
    riskGrade: '위험 등급',
    
    // Status
    available: '구매 가능',
    pending: '처리 중',
    sold: '판매됨',
    processing: '처리 중...',
    
    // Actions
    purchase: '구매',
    purchaseWithMultisig: '멀티시그로 구매',
    connectWalletToPurchase: '구매를 위해 지갑 연결',
    inquireNow: '문의하기',
    submitInquiry: '상담 신청',
    submitting: '제출 중...',
    
    // Concierge
    professionalConciergeService: '전문 컨시어지 서비스',
    inquiryForm: '상담 신청',
    name: '이름 *',
    phone: '연락처 *',
    email: '이메일',
    inquiryDetails: '상담 내용 *',
    contactInformation: '연락처 정보',
    
    // Footer
    footerCopyright: '© 2025 WellSwap. 글로벌 보험 양도 플랫폼.',
  },
  
  zh: {
    // Navigation
    sell: '保险销售',
    buy: '保险购买',
    inquiry: '礼宾服务',
    
    // Common
    wallet: '连接钱包',
    connectWallet: '连接钱包',
    walletNotConnected: '钱包未连接',
    
    // Authentication
    multisigAuthRequired: '需要多重签名认证',
    multisigAuthComplete: '多重签名认证完成',
    multisigConnecting: '连接多重签名中...',
    perfectMultisigAuthRequired: '需要完美多重签名认证',
    step1MultisigRegistration: '第1步：多重签名注册（300美元）',
    
    // Insurance
    selectInsuranceCompany: '选择保险公司',
    selectProductCategory: '选择产品类别',
    selectContractPeriod: '选择合同期限',
    selectPaidPeriod: '选择缴费期限',
    contractPeriod: '合同期限',
    paymentPeriod: '缴费期限',
    annualPremium: '年保费',
    surrenderValue: '退保价值',
    transferValue: '转让价值',
    platformPrice: '平台价格',
    confidence: 'AI置信度',
    riskGrade: '风险等级',
    
    // Status
    available: '可购买',
    pending: '处理中',
    sold: '已售出',
    processing: '处理中...',
    
    // Actions
    purchase: '购买',
    purchaseWithMultisig: '使用多重签名购买',
    connectWalletToPurchase: '连接钱包购买',
    inquireNow: '立即咨询',
    submitInquiry: '提交咨询',
    submitting: '提交中...',
    
    // Concierge
    professionalConciergeService: '专业礼宾服务',
    inquiryForm: '咨询表单',
    name: '姓名 *',
    phone: '电话 *',
    email: '邮箱',
    inquiryDetails: '咨询详情 *',
    contactInformation: '联系信息',
    
    // Footer
    footerCopyright: '© 2025 WellSwap. 全球保险转让平台.',
  },
  
  ja: {
    // Navigation
    sell: '保険販売',
    buy: '保険購入',
    inquiry: 'コンシェルジュ',
    
    // Common
    wallet: 'ウォレット接続',
    connectWallet: 'ウォレット接続',
    walletNotConnected: 'ウォレットが接続されていません',
    
    // Authentication
    multisigAuthRequired: 'マルチシグ認証が必要',
    multisigAuthComplete: 'マルチシグ認証完了',
    multisigConnecting: 'マルチシグ接続中...',
    perfectMultisigAuthRequired: '完全なマルチシグ認証が必要',
    step1MultisigRegistration: 'ステップ1：マルチシグ登録（300ドル）',
    
    // Insurance
    selectInsuranceCompany: '保険会社を選択',
    selectProductCategory: '商品カテゴリを選択',
    selectContractPeriod: '契約期間を選択',
    selectPaidPeriod: '支払期間を選択',
    contractPeriod: '契約期間',
    paymentPeriod: '支払期間',
    annualPremium: '年間保険料',
    surrenderValue: '解約返戻金',
    transferValue: '譲渡価値',
    platformPrice: 'プラットフォーム価格',
    confidence: 'AI信頼度',
    riskGrade: 'リスク等級',
    
    // Status
    available: '購入可能',
    pending: '処理中',
    sold: '売却済み',
    processing: '処理中...',
    
    // Actions
    purchase: '購入',
    purchaseWithMultisig: 'マルチシグで購入',
    connectWalletToPurchase: '購入のためにウォレット接続',
    inquireNow: '今すぐ問い合わせ',
    submitInquiry: '問い合わせ送信',
    submitting: '送信中...',
    
    // Concierge
    professionalConciergeService: 'プロフェッショナルコンシェルジュサービス',
    inquiryForm: '問い合わせフォーム',
    name: '名前 *',
    phone: '電話 *',
    email: 'メール',
    inquiryDetails: '問い合わせ詳細 *',
    contactInformation: '連絡先情報',
    
    // Footer
    footerCopyright: '© 2025 WellSwap. グローバル保険譲渡プラットフォーム.',
  },
};

export const getTranslation = (language: Language): Translations => {
  return translations[language] || translations.en;
};
