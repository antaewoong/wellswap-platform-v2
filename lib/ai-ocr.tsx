'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, Camera, Search, Filter, Star, MapPin, Calendar, 
  DollarSign, Users, Bell, Settings, Menu, X, Check, 
  AlertCircle, TrendingUp, Shield, Zap, Globe, Award,
  ArrowRight, Play, Heart, Share2, Eye, Download,
  ChevronRight, Lock, BarChart3, Target, Wallet,
  FileText, CreditCard, Timer, CheckCircle2, ExternalLink,
  User, LogOut, Plus, Edit, Trash2, Building2, Phone,
  Mail, Languages, ChevronDown
} from 'lucide-react';

const WellSwapComplete = () => {
  // Basic state management
  const [currentView, setCurrentView] = useState('home');
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [uploadMethod, setUploadMethod] = useState('camera');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedCompany, setSelectedCompany] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [insuranceForm, setInsuranceForm] = useState({
    company_name: '',
    product_name: '',
    product_type: 'Life Insurance',
    policy_number: '',
    original_value: '',
    purchase_date: '',
    maturity_date: '',
    premium_amount: '',
    currency: 'USD',
    location: 'Hong Kong'
  });

  // Static data (no external dependencies for now)
  const hongKongInsurers = [
    "AIA Hong Kong", "Prudential Hong Kong", "Great Eastern Life",
    "FWD Insurance", "Sun Life Hong Kong", "Manulife Hong Kong",
    "Zurich Insurance", "Generali Hong Kong", "HSBC Life",
    "Standard Chartered Insurance", "China Life Insurance",
    "Ping An Insurance", "CPIC Life Insurance", "New China Life",
    "China Taiping Life", "BOC Life", "Bank of China Group Insurance",
    "ICBC-AXA Life", "CCB Life", "CMB Life Insurance",
    "Hang Seng Insurance", "DBS Insurance", "Citibank Life",
    "American International Assurance", "MetLife Hong Kong",
    "Allianz Hong Kong", "Aviva Hong Kong", "QBE Hong Kong",
    "Liberty Insurance", "Chubb Insurance"
  ];

  const productTypes = [
    "Life Insurance", "Whole Life Insurance", "Term Life Insurance",
    "Universal Life Insurance", "Endowment Insurance", "Savings Insurance",
    "Investment Linked Insurance", "Annuity", "Medical Insurance",
    "Critical Illness Insurance", "Disability Insurance", "Travel Insurance"
  ];

  // Translations
  const translations = {
    en: {
      title: "TRADE YOUR INSURANCE",
      subtitle: "World's first AI-powered insurance trading platform",
      uploadDocument: "Upload Document",
      takePhoto: "Take Photo", 
      manualEntry: "Manual Entry",
      selectCompany: "Select Insurance Company",
      customCompany: "Other Company (Enter manually)",
      productName: "Product Name",
      productType: "Product Type",
      policyNumber: "Policy Number",
      originalValue: "Original Value",
      purchaseDate: "Purchase Date",
      maturityDate: "Maturity Date",
      premiumAmount: "Premium Amount",
      currency: "Currency",
      location: "Location",
      startAnalysis: "Start AI Analysis",
      analyzing: "Analyzing...",
      marketplace: "Marketplace",
      dashboard: "Dashboard",
      signIn: "Sign In",
      signUp: "Sign Up",
      connectWallet: "Connect Wallet",
      home: "Home"
    },
    ko: {
      title: "보험을 거래하세요",
      subtitle: "AI 기반 세계 최초 보험 거래 플랫폼",
      uploadDocument: "문서 업로드",
      takePhoto: "사진 촬영",
      manualEntry: "직접 입력",
      selectCompany: "보험사 선택",
      customCompany: "기타 보험사 (직접 입력)",
      productName: "상품명",
      productType: "상품 유형",
      policyNumber: "증권번호",
      originalValue: "원래 가치",
      purchaseDate: "가입일",
      maturityDate: "만기일",
      premiumAmount: "보험료",
      currency: "통화",
      location: "지역",
      startAnalysis: "AI 분석 시작",
      analyzing: "분석 중...",
      marketplace: "마켓플레이스",
      dashboard: "대시보드",
      signIn: "로그인",
      signUp: "회원가입",
      connectWallet: "지갑 연결",
      home: "홈"
    },
    zh: {
      title: "交易您的保险",
      subtitle: "全球首个AI驱动的保险交易平台",
      uploadDocument: "上传文件",
      takePhoto: "拍照",
      manualEntry: "手动输入",
      selectCompany: "选择保险公司",
      customCompany: "其他保险公司（手动输入）",
      productName: "产品名称",
      productType: "产品类型",
      policyNumber: "保单号码",
      originalValue: "原始价值",
      purchaseDate: "购买日期",
      maturityDate: "到期日期",
      premiumAmount: "保险费",
      currency: "货币",
      location: "地区",
      startAnalysis: "开始AI分析",
      analyzing: "分析中...",
      marketplace: "市场",
      dashboard: "仪表板",
      signIn: "登录",
      signUp: "注册",
      connectWallet: "连接钱包",
      home: "首页"
    }
  };

  const t = translations[language];

  // Basic BNB price fetching
  useEffect(() => {
    const fetchBNBPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
        const data = await response.json();
        setBnbPrice(data.binancecoin.usd);
      } catch (error) {
        console.error('Error fetching BNB price:', error);
      }
    };

    fetchBNBPrice();
    const interval = setInterval(fetchBNBPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simple file upload handler with OCR
  const handleFileUpload = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    console.log('Starting OCR processing for file:', file.name);
    
    try {
      // Dynamic import of Tesseract.js
      const { createWorker } = await import('tesseract.js');
      
      const worker = await createWorker();
      await worker.loadLanguage('eng+kor+chi_sim');
      await worker.initialize('eng+kor+chi_sim');
      
      console.log('OCR worker initialized');
      
      // OCR processing
      const { data: { text, confidence } } = await worker.recognize(file);
      await worker.terminate();
      
      console.log('OCR completed:', { 
        textLength: text.length, 
        confidence: confidence,
        text: text.substring(0, 200) + '...'
      });
      
      // Simple text parsing for insurance information
      const extractedData = parseInsuranceText(text);
      console.log('Extracted data:', extractedData);
      
      // Auto-fill form with extracted data
      if (extractedData.company) {
        if (hongKongInsurers.includes(extractedData.company)) {
          setSelectedCompany(extractedData.company);
        } else {
          setSelectedCompany('custom');
          setCustomCompany(extractedData.company);
        }
      }
      
      setInsuranceForm(prev => ({
        ...prev,
        company_name: extractedData.company || '',
        product_name: extractedData.productName || '',
        policy_number: extractedData.policyNumber || '',
        original_value: extractedData.originalValue || '',
        purchase_date: extractedData.purchaseDate || '',
        maturity_date: extractedData.maturityDate || '',
        premium_amount: extractedData.premiumAmount || '',
        currency: extractedData.currency || 'USD',
        location: extractedData.location || 'Hong Kong'
      }));
      
      alert(`OCR 분석 완료!\n신뢰도: ${confidence.toFixed(1)}%\n추출된 텍스트: ${text.length}글자`);
      
    } catch (error) {
      console.error('OCR processing error:', error);
      alert('OCR 처리 중 오류가 발생했습니다. 수동 입력을 사용해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple insurance text parsing function
  const parseInsuranceText = (text) => {
    const extracted = {};
    
    try {
      // Company name patterns
      const companyPatterns = [
        /(?:Company|보험회사|公司)[:\s]*([A-Za-z가-힣\s&]+)/i,
        /(AIA|Prudential|Great Eastern|FWD|Sun Life|Manulife|Zurich|Generali|HSBC)/i
      ];
      
      for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.company = match[1] || match[0];
          break;
        }
      }
      
      // Policy number
      const policyMatch = text.match(/(?:Policy|Certificate|증권)[:\s]*([A-Z0-9\-]+)/i);
      if (policyMatch) extracted.policyNumber = policyMatch[1];
      
      // Product name
      const productMatch = text.match(/(?:Product|Plan|상품명)[:\s]*([A-Za-z가-힣\s]+)/i);
      if (productMatch) extracted.productName = productMatch[1];
      
      // Original value
      const valueMatch = text.match(/(?:Sum Assured|Coverage|보장금액)[:\s]*\$?([0-9,]+)/i);
      if (valueMatch) extracted.originalValue = valueMatch[1].replace(/,/g, '');
      
      // Premium amount
      const premiumMatch = text.match(/(?:Premium|보험료)[:\s]*\$?([0-9,]+)/i);
      if (premiumMatch) extracted.premiumAmount = premiumMatch[1].replace(/,/g, '');
      
      // Currency
      const currencyMatch = text.match(/(USD|HKD|SGD|CNY|KRW)/i);
      if (currencyMatch) extracted.currency = currencyMatch[1];
      
      // Dates
      const dateMatches = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g);
      if (dateMatches) {
        if (dateMatches[0]) extracted.purchaseDate = dateMatches[0];
        if (dateMatches[1]) extracted.maturityDate = dateMatches[1];
      }
      
      // Location
      if (text.includes('Hong Kong') || text.includes('홍콩')) {
        extracted.location = 'Hong Kong';
      } else if (text.includes('Singapore') || text.includes('싱가포르')) {
        extracted.location = 'Singapore';
      }
      
    } catch (error) {
      console.error('Text parsing error:', error);
    }
    
    return extracted;
  };

  // Camera capture
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) handleFileUpload(file);
    };
    input.click();
  };

  // File input
  const handleFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) handleFileUpload(file);
    };
    input.click();
  };

  // Form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    console.log('Form submitted:', {
      ...insuranceForm,
      company_name: selectedCompany === 'custom' ? customCompany : selectedCompany
    });
    
    alert('Form submitted successfully! (Demo mode)');
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-black">WellSwap</div>
        
        <div className="hidden lg:flex space-x-8">
          <button 
            onClick={() => setCurrentView('home')}
            className={`${currentView === 'home' ? 'text-black' : 'text-gray-600'} hover:text-black transition-colors`}
          >
            {t.home}
          </button>
          <button 
            onClick={() => setCurrentView('upload')}
            className={`${currentView === 'upload' ? 'text-black' : 'text-gray-600'} hover:text-black transition-colors`}
          >
            {t.uploadDocument}
          </button>
          <button 
            onClick={() => setCurrentView('marketplace')}
            className={`${currentView === 'marketplace' ? 'text-black' : 'text-gray-600'} hover:text-black transition-colors`}
          >
            {t.marketplace}
          </button>
          {user && (
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`${currentView === 'dashboard' ? 'text-black' : 'text-gray-600'} hover:text-black transition-colors`}
            >
              {t.dashboard}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="zh">中文</option>
          </select>

          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold">{user.full_name || 'User'}</span>
              <button 
                onClick={() => setUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              {t.signIn}
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  // Upload Methods Component
  const UploadMethods = () => (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl lg:text-6xl font-black text-center mb-8">
        {t.title}
      </h1>
      <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
        {t.subtitle}
      </p>

      {/* Upload Method Selection */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <button
          onClick={() => setUploadMethod('camera')}
          className={`p-8 rounded-2xl border-2 transition-all ${
            uploadMethod === 'camera' 
              ? 'border-black bg-black text-white' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Camera className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{t.takePhoto}</h3>
          <p className="text-sm opacity-75">Quick capture with camera</p>
        </button>

        <button
          onClick={() => setUploadMethod('file')}
          className={`p-8 rounded-2xl border-2 transition-all ${
            uploadMethod === 'file' 
              ? 'border-black bg-black text-white' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{t.uploadDocument}</h3>
          <p className="text-sm opacity-75">Upload image or PDF</p>
        </button>

        <button
          onClick={() => setUploadMethod('manual')}
          className={`p-8 rounded-2xl border-2 transition-all ${
            uploadMethod === 'manual' 
              ? 'border-black bg-black text-white' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Edit className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{t.manualEntry}</h3>
          <p className="text-sm opacity-75">Type information manually</p>
        </button>
      </div>

      {/* Upload Interface */}
      {uploadMethod === 'camera' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <Camera className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <button
            onClick={handleCameraCapture}
            className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            {t.takePhoto}
          </button>
          <p className="text-sm text-gray-500 mt-4">Position your insurance document clearly</p>
        </div>
      )}

      {uploadMethod === 'file' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <Upload className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <button
            onClick={handleFileInput}
            className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            {t.uploadDocument}
          </button>
          <p className="text-sm text-gray-500 mt-4">JPEG, PNG, PDF files (max 10MB)</p>
          {selectedFile && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-700">File selected: {selectedFile.name}</p>
            </div>
          )}
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mt-8">
          <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full mx-auto mb-6"></div>
          <h3 className="text-xl font-bold mb-2">AI OCR 분석 중...</h3>
          <p className="text-gray-600">문서에서 보험 정보를 추출하고 있습니다.</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>✓ Tesseract.js OCR 엔진 초기화</p>
            <p>✓ 다국어 텍스트 추출 (한/영/중)</p>
            <p>✓ 보험 정보 자동 파싱</p>
          </div>
        </div>
      )}

      {/* File Selected State */}
      {selectedFile && !isProcessing && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mt-8">
          <h3 className="text-xl font-bold mb-4">업로드된 파일</h3>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  크기: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            OCR 분석이 완료되었습니다. 아래 폼에서 추출된 정보를 확인하세요.
          </p>
        </div>
      )}
    </div>
  );

  // Insurance Form Component
  const InsuranceForm = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h3 className="text-2xl font-bold mb-6">Insurance Information</h3>
      
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Company Selection */}
        <div>
          <label className="block text-sm font-semibold mb-3">{t.selectCompany}</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          >
            <option value="">{t.selectCompany}</option>
            {hongKongInsurers.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
            <option value="custom">{t.customCompany}</option>
          </select>
        </div>

        {/* Custom Company Input */}
        {selectedCompany === 'custom' && (
          <div>
            <label className="block text-sm font-semibold mb-3">Company Name</label>
            <input
              type="text"
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              placeholder="Enter insurance company name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
        )}

        {/* Product Information */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-3">{t.productName}</label>
            <input
              type="text"
              value={insuranceForm.product_name}
              onChange={(e) => setInsuranceForm({...insuranceForm, product_name: e.target.value})}
              placeholder="e.g., Premier Treasure"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">{t.productType}</label>
            <select
              value={insuranceForm.product_type}
              onChange={(e) => setInsuranceForm({...insuranceForm, product_type: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              {productTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-3">{t.policyNumber}</label>
            <input
              type="text"
              value={insuranceForm.policy_number}
              onChange={(e) => setInsuranceForm({...insuranceForm, policy_number: e.target.value})}
              placeholder="POL-123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">{t.originalValue}</label>
            <input
              type="number"
              value={insuranceForm.original_value}
              onChange={(e) => setInsuranceForm({...insuranceForm, original_value: e.target.value})}
              placeholder="125000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
              min="1000"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isProcessing ? t.analyzing : t.startAnalysis}
        </button>
      </form>
    </div>
  );

  // Auth Modal Component
  const AuthModal = () => {
    if (!isAuthModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {authMode === 'signin' ? t.signIn : t.signUp}
            </h2>
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            setUser({ full_name: 'Test User', email: 'test@example.com' });
            setIsAuthModalOpen(false);
          }}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              {authMode === 'signin' ? t.signIn : t.signUp}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-gray-600 hover:text-black transition-colors"
            >
              {authMode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading WellSwap...</p>
        </div>
      </div>
    );
  }

  // Main Component Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <AuthModal />
      
      {/* Network Status */}
      {bnbPrice > 0 && (
        <div className="bg-black text-white px-6 py-2 text-center text-sm">
          <span className="font-mono">BNB: ${bnbPrice.toFixed(2)}</span>
          <span className="ml-6 font-mono">Registration Fee: ~{(300 / bnbPrice).toFixed(4)} BNB</span>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'home' && (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl lg:text-8xl font-black mb-8">
            WELLSWAP
          </h1>
          <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
          <div className="flex flex-col lg:flex-row gap-6 justify-center">
            <button
              onClick={() => setCurrentView('upload')}
              className="px-12 py-6 bg-black text-white rounded-xl text-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              {t.startAnalysis}
            </button>
            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-12 py-6 border-2 border-black rounded-xl text-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              {t.marketplace}
            </button>
          </div>
        </div>
      )}

      {currentView === 'upload' && <UploadMethods />}

      {currentView === 'marketplace' && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-black mb-8">Insurance Marketplace</h1>
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Marketplace coming soon...</p>
          </div>
        </div>
      )}

      {currentView === 'dashboard' && user && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-black mb-8">My Dashboard</h1>
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Dashboard coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellSwapComplete;
