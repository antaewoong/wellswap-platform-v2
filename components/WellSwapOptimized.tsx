'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ethers } from 'ethers';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  ParallaxSection,
  FadeInAnimation,
  TypewriterText,
  GradientBackground
} from "./animations/AnimationComponents";
import { supabase } from '../lib/database-wellswap';
import { useWeb3 } from '../providers/web3';
// ContractIntegration에서 필요한 함수들은 동적 import로 처리
import { SafeInput } from './SafeInput';
import { AdminInquiryPanel } from './AdminInquiryPanel';
import HomePage from './pages/HomePage';
import SellPage from './pages/SellPage';
import BuyPage from './pages/BuyPage';
import ConciergePage from './pages/ConciergePage';

// 분리된 컴포넌트들
import { AppLayout } from './layout/AppLayout';
import { PageRouter } from './layout/PageRouter';
import { useAppState } from '../hooks/useAppState';
import { useApiIntegration } from '../hooks/useApiIntegration';

// 타입 정의
type TDict = any;

// 🧮 자동 계산 유틸리티 함수들
const calculateInsuranceValues = (annualPayment: number, contractPeriod: string, paidPeriod: string) => {
  const contractYears = parseInt(contractPeriod.replace(/\D/g, '')) || 0;
  const paidYears = parseInt(paidPeriod.replace(/\D/g, '')) || 0;
  
  const contractTotalAmount = annualPayment * contractYears;
  const totalPaidAmount = annualPayment * paidYears;
  const remainingAmount = contractTotalAmount - totalPaidAmount;
  const progressPercentage = contractYears > 0 ? (paidYears / contractYears) * 100 : 0;
  
  return {
    contractTotalAmount,
    totalPaidAmount,
    remainingAmount,
    progressPercentage,
    contractYears,
    paidYears
  };
};

export default function WellSwapOptimized() {
  // 상태 관리 훅 사용
  const appState = useAppState();
  const apiIntegration = useApiIntegration();
  
  // Web3 훅 사용
  const { 
    provider, 
    signer, 
    contract, 
    account: web3Account, 
    isConnected: isWeb3Connected, 
    networkError, 
    connectWallet: connectWeb3Wallet, 
    usdToBnb 
  } = useWeb3();

  // Web3 상태를 앱 상태와 동기화
  useEffect(() => {
    appState.setWeb3Account(web3Account);
    appState.setIsWeb3Connected(isWeb3Connected);
  }, [web3Account, isWeb3Connected, appState]);

  // 거래 단계 관리
  const [tradeSteps, setTradeSteps] = useState({
    stage: 0,
    registrationTxHash: '',
    feeTxHash: '',
    assetId: ''
  });

  // 자동 환불 상태
  const [autoRefundStatus, setAutoRefundStatus] = useState({
    eligibleAssets: [],
    totalRefundAmount: 0,
    processedCount: 0,
    processing: false
  });

  // 📸 OCR AI 상태 관리
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<any>(null);

  // 🤖 AI 크롤링 데이터 상태
  const [fulfillmentData, setFulfillmentData] = useState<any>(null);
  const [isCrawling, setIsCrawling] = useState(false);

  // 보험 데이터 상태
  const [insuranceData, setInsuranceData] = useState({});
  const memoizedInsuranceData = useMemo(() => insuranceData, [insuranceData]);

  // 홍콩 보험사 데이터
  const globalInsurers = [
    'AIA Group Limited', 'Prudential plc', 'Manulife Financial', 'Sun Life Financial',
    'Great Eastern Holdings', 'FWD Group', 'Zurich Insurance Group', 'AXA',
    'Generali', 'Allianz', 'MetLife', 'New York Life', 'Pacific Century Group',
    'BOC Life', 'China Life Insurance', 'CNOOC', 'CMB Wing Lung Bank',
    'Standard Chartered', 'HSBC Life', 'Hang Seng Bank', 'Bank of East Asia',
    'DBS Bank', 'OCBC Bank', 'UOB', 'Citibank', 'BNP Paribas',
    'Societe Generale', 'Credit Suisse', 'UBS', 'Morgan Stanley'
  ];

  const globalCategories = [
    'Savings Plan', 'Pension Plan', 'Investment Linked', 'Whole Life',
    'Endowment Plan', 'Annuity', 'Medical Insurance', 'Term Life'
  ];

  const contractPeriods = [
    '2 Years', '3 Years', '5 Years', '7 Years', '10 Years', '15 Years', '20 Years', 'Custom Input'
  ];

  const paidPeriods = [
    '1 Year', '2 Years', '3 Years', '4 Years', '5 Years', '6 Years', '7 Years', '8 Years', '9 Years', '10 Years',
    '11 Years', '12 Years', '13 Years', '14 Years', '15 Years', '16 Years', '17 Years', '18 Years', '19 Years', '20 Years'
  ];

  const calculatePaymentOptions = useCallback((period: string) => {
    if (!period || period === 'Custom Input') return [];
    
    const periodMap: { [key: string]: number } = {
      '2 Years': 2, '3 Years': 3, '5 Years': 5, '7 Years': 7, '10 Years': 10, '15 Years': 15, '20 Years': 20
    };
    
    const years = periodMap[period] || 0;
    return Array.from({ length: years }, (_, i) => `${i + 1} Year${i > 0 ? 's' : ''}`);
  }, []);

  // 멀티시그 지갑 연결 및 인증 (API Routes 사용)
  const connectWalletWithAuth = async () => {
    appState.setIsLoading(true);
    try {
      console.log('🔗 멀티시그 지갑 연결 시작...');
      
      const eth = (window as any).ethereum;
      if (!eth) {
        throw new Error('MetaMask가 설치되지 않았습니다');
      }

      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      if (!accounts?.[0]) {
        throw new Error('계정을 선택해주세요');
      }

      const walletAddress = accounts[0];
      console.log('💰 지갑 주소 확인:', walletAddress);
      
      if (!isWeb3Connected) {
        await connectWeb3Wallet();
      }
      
      appState.setConnectedAccount(walletAddress);
      
      // API Routes를 통한 사용자 처리
      console.log('🗄️ API Routes를 통한 사용자 처리 중...');
      
      try {
        const result = await apiIntegration.createOrUpdateUser(walletAddress, {
          reputation_score: 100,
          total_trades: 0
        });

        console.log('📡 API 응답:', result);
        
        if (result.success && result.user) {
          console.log('✅ 사용자 처리 완료:', result.user);
          console.log('👑 관리자 권한:', result.isAdmin);
          
          appState.setUser(result.user);
          appState.setIsAuthenticated(true);
          
          if (result.isAdmin) {
            console.log('🎉 관리자로 인증됨!');
            appState.setCurrentPage('admin');
          }
        } else {
          console.error('API 응답 형식 오류:', result);
          throw new Error('사용자 처리 실패');
        }
        
      } catch (apiError) {
        console.error('API 오류:', apiError);
        throw new Error(`사용자 인증에 실패했습니다: ${apiError.message}`);
      }
      
      console.log('🎉 멀티시그 인증 완료!');
    } catch (error) {
      console.error('❌ 멀티시그 지갑 연결 실패:', error);
      alert('멀티시그 지갑 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      appState.setIsLoading(false);
    }
  };

  // Gmail 로그인 처리
  const handleGmailLogin = async () => {
    appState.setIsLoading(true);
    try {
      console.log('🔐 Gmail 로그인 시작...');
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=email profile&access_type=offline`;
      
      const popup = window.open(googleAuthUrl, 'googleAuth', 'width=500,height=600');
      
      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { code } = event.data;
          
          try {
            const response = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code })
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log('✅ Gmail 로그인 성공:', result);
              appState.setIsAuthenticated(true);
            } else {
              throw new Error('Gmail 로그인 실패');
            }
          } catch (error) {
            console.error('Gmail 로그인 오류:', error);
            alert('Gmail 로그인에 실패했습니다.');
          }
        }
      });
    } catch (error) {
      console.error('Gmail 로그인 오류:', error);
      alert('Gmail 로그인에 실패했습니다.');
    } finally {
      appState.setIsLoading(false);
    }
  };

  // 문의 제출 처리
  const handleInquirySubmit = async (inquiryData: any) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([{
          name: inquiryData.name,
          phone: inquiryData.phone,
          email: inquiryData.email,
          inquiry_content: inquiryData.content,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      alert('문의가 성공적으로 제출되었습니다.');
      return { success: true };
    } catch (error) {
      console.error('문의 제출 오류:', error);
      alert('문의 제출에 실패했습니다.');
      return { success: false, error };
    }
  };

  // 자동 환불 자격 확인
  const checkAutoRefundEligibility = async () => {
    setAutoRefundStatus(prev => ({ ...prev, processing: true }));
    try {
      // 자동 환불 로직 구현
      console.log('🔍 자동 환불 자격 확인 중...');
      
      // 임시 데이터
      setAutoRefundStatus({
        eligibleAssets: [],
        totalRefundAmount: 0,
        processedCount: 0,
        processing: false
      });
      
      alert('자동 환불 자격 확인이 완료되었습니다.');
    } catch (error) {
      console.error('자동 환불 확인 오류:', error);
      alert('자동 환불 확인에 실패했습니다.');
    }
  };

  // AI 크롤링 데이터 가져오기
  const fetchFulfillmentData = async (insurerName: string, productType: string, policyYear?: number) => {
    setIsCrawling(true);
    try {
      console.log('🤖 AI 크롤링 데이터 가져오기:', { insurerName, productType, policyYear });
      
      // 임시 데이터 반환
      const mockData = {
        adjustmentFactor: 1.2,
        reliabilityScore: 0.85,
        recommendation: 'premium'
      };
      
      setFulfillmentData(mockData);
      return mockData;
    } catch (error) {
      console.error('AI 크롤링 오류:', error);
      throw error;
    } finally {
      setIsCrawling(false);
    }
  };

  // 크롤링 트리거
  const triggerCrawling = async () => {
    try {
      console.log('🔄 수동 크롤링 트리거');
      await fetchFulfillmentData('AIA Group Limited', 'Savings Plan', 5);
    } catch (error) {
      console.error('크롤링 트리거 오류:', error);
    }
  };

  // 폼 핸들러들
  const handleRefChange = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInsuranceData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFinalChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInsuranceData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // 판매 제출 처리
  const handleSellSubmitWithStats = async () => {
    if (!appState.isAuthenticated || !isWeb3Connected || !appState.connectedAccount) {
      alert('지갑 연결이 필요합니다.');
      return;
    }
    
    appState.setIsLoading(true);
    try {
      console.log('🚀 멀티시그 거래 시작...');
      setTradeSteps(prev => ({ ...prev, stage: 1 }));
      
      const assetId = 1;
      const REG_FEE_USD = Number(process.env.NEXT_PUBLIC_REGISTRATION_FEE_USD ?? '300');
      console.log('💰 등록비 설정:', REG_FEE_USD, 'USD');
      
      const agreedPriceWei = await usdToBnb(REG_FEE_USD);
      if (!agreedPriceWei || agreedPriceWei === '0') {
        alert('등록비 계산이 0으로 나왔습니다. 환경변수/네트워크 확인 부탁드립니다.');
        return;
      }
      
      console.log('✅ 등록비 wei 변환 완료:', agreedPriceWei);
      
      // registerAsset 함수 직접 호출
      const { registerAsset } = await import('./ContractIntegration');
      const registrationResult = await registerAsset(assetId, agreedPriceWei);
      
      if (registrationResult) {
        console.log('✅ 자산 등록 완료:', registrationResult);
        setTradeSteps(prev => ({
          ...prev,
          stage: 2,
          registrationTxHash: registrationResult.transactionHash || registrationResult.hash,
          assetId: '1'
        }));
        alert('✅ 멀티시그 등록이 성공적으로 완료되었습니다! (300 USD 등록비)');
        setInsuranceData({});
        setTradeSteps({ stage: 0, registrationTxHash: '', feeTxHash: '', assetId: '' });
      }
    } catch (error) {
      console.error('❌ 거래 실패:', error);
      alert('거래 중 오류가 발생했습니다: ' + (error as Error).message);
    } finally {
      appState.setIsLoading(false);
    }
  };

  // 구매 제출 처리
  const handleBuySubmitWithStats = async (listing?: any) => {
    console.log('🛒 구매 상태 확인:', { 
      isAuthenticated: appState.isAuthenticated, 
      isWeb3Connected, 
      connectedAccount: appState.connectedAccount, 
      web3Account 
    });
    
    let currentWalletAddress = appState.connectedAccount || web3Account;
    
    if (!currentWalletAddress) {
      const eth = (window as any).ethereum;
      if (eth) {
        try {
          const accounts = await eth.request({ method: 'eth_accounts' });
          currentWalletAddress = accounts?.[0];
          if (currentWalletAddress) {
            appState.setConnectedAccount(currentWalletAddress);
          }
        } catch (error) {
          console.error('지갑 주소 확인 실패:', error);
        }
      }
    }
    
    if (!appState.isAuthenticated || !currentWalletAddress) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }
    
    appState.setIsLoading(true);
    try {
      console.log('🛒 멀티시그 구매 시작...');
      
      const assetData = {
        companyName: listing?.company || 'Buyer Registration',
        productName: listing?.productName || 'Insurance Purchase',
        category: listing?.category || 'Purchase',
        surrenderValueUSD: listing?.surrenderValue || 0,
        contractPeriod: listing?.contractPeriod || '0',
        annualPaymentUSD: listing?.annualPayment || 0,
        totalPaymentUSD: listing?.platformPrice || 0
      };

      console.log('📝 멀티시그 거래 생성 데이터:', assetData);
      
      if (!contract || !signer) {
        throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다');
      }
      
      if (!assetData.totalPaymentUSD || assetData.totalPaymentUSD <= 0) {
        alert('Please check the price amount.');
        return;
      }
      
      const agreedPriceWei = await usdToBnb(assetData.totalPaymentUSD);
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.createMultisigTrade(
          1,
          agreedPriceWei
        );
        console.log('⛽ 가스 추정값:', gasEstimate.toString());
      } catch (gasError) {
        console.warn('⚠️ 가스 추정 실패, 기본값 사용');
        gasEstimate = ethers.utils.hexlify(500000);
      }
      
      console.log('🔗 컨트랙트 함수 호출 준비:', {
        assetId: 1,
        agreedPriceWei: agreedPriceWei.toString(),
        value: agreedPriceWei.toString(),
        gasLimit: typeof gasEstimate === 'string' ? gasEstimate : gasEstimate.mul(120).div(100).toString(),
        contractAddress: contract.address,
        contractFunctions: Object.keys(contract.functions || {})
      });

      if (contract.address !== '0xa84125fe1503485949d3e4fedcc454429289c8ea') {
        console.warn('⚠️ 컨트랙트 주소 불일치:', contract.address);
      }

      if (!contract.createMultisigTrade) {
        console.error('❌ createMultisigTrade 함수가 컨트랙트에 존재하지 않습니다!');
        console.log('사용 가능한 함수들:', Object.keys(contract.functions || {}));
        throw new Error('컨트랙트에 createMultisigTrade 함수가 없습니다');
      }

      console.log('✅ createMultisigTrade 함수 확인됨');

      let tx;
      try {
        console.log('🔄 createMultisigTrade 호출 중...');
        
        tx = await contract.createMultisigTrade(
          1,
          agreedPriceWei,
          {
            value: agreedPriceWei,
            gasLimit: (ethers.BigNumber.isBigNumber(gasEstimate) ? gasEstimate : ethers.BigNumber.from(gasEstimate)).mul(120).div(100)
          }
        );
        console.log('✅ createMultisigTrade 호출 성공!');
      } catch (error) {
        console.log('❌ createMultisigTrade 호출 실패:', error.message);
        throw error;
      }
      
      console.log('📤 트랜잭션 전송됨:', tx.hash);
      const receipt = await tx.wait();

      console.log('✅ 구매 완료:', receipt);
      alert('구매가 완료되었습니다!');
      
      try {
        const updateResponse = await apiIntegration.updateInsuranceAsset({
          id: listing?.id?.toString() || '1',
          status: 'sold',
          buyer_address: currentWalletAddress,
          sold_at: new Date().toISOString(),
          sold_price: listing?.platformPrice || 0,
          walletAddress: currentWalletAddress
        });

        if (!updateResponse.success) {
          console.warn('⚠️ 보험 자산 상태 업데이트 실패');
        } else {
          console.log('✅ 보험 자산 상태 업데이트 완료');
        }
      } catch (updateError) {
        console.error('보험 자산 상태 업데이트 오류:', updateError);
      }
        
    } catch (error: any) {
      console.error('❌ 구매 실패:', error);
      const message = (error?.reason || error?.message || '').toLowerCase();
      
      if (message.includes('user rejected')) {
        alert('서명이 취소되었습니다');
      } else if (message.includes('insufficient')) {
        alert('잔액이 부족합니다');
      } else if (message.includes('network')) {
        alert('네트워크 연결에 문제가 있습니다');
      } else {
        alert(`구매 실패: ${error?.message ?? error}`);
      }
    } finally {
      appState.setIsLoading(false);
    }
  };

  // 실제 등록된 매도 상품 데이터 상태
  const [listingData, setListingData] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  // 실제 등록된 매도 상품 데이터 가져오기
  const loadListingData = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const result = await apiIntegration.getInsuranceAssets();
      console.log('📋 등록된 매도 상품 데이터:', result);
      
      const assets = result.assets || [];
      const formattedListings = assets.map((item: any, index: number) => ({
        id: item.id || index + 1,
        company: item.company_name || 'Unknown Company',
        productName: item.product_name || 'Unknown Product',
        category: item.product_category || 'General',
        surrenderValue: item.surrender_value_usd || 0,
        transferValue: item.transfer_value_usd || 0,
        platformPrice: item.platform_price_usd || 0,
        confidence: item.ai_confidence_score ? item.ai_confidence_score / 100 : 0.8,
        riskGrade: item.risk_grade || 'B',
        contractPeriod: item.contract_period ? `${item.contract_period} Years` : 'Unknown',
        paidPeriod: item.paid_period ? `${item.paid_period} Years` : 'Unknown',
        annualPayment: item.annual_premium_usd || 0,
        status: item.status || 'available',
        seller: item.seller_wallet_address ? 
          `${item.seller_wallet_address.substring(0, 6)}...${item.seller_wallet_address.substring(38)}` : 
          'Unknown Seller',
        listingDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown Date'
      }));
      
      setListingData(formattedListings);
    } catch (error) {
      console.error('❌ 매도 상품 데이터 로드 오류:', error);
      setListingData([
        {
          id: 1,
          company: 'AIA Group Limited',
          productName: 'AIA Savings Plan',
          category: 'Savings Plan',
          surrenderValue: 12000,
          transferValue: 11500,
          platformPrice: 15000,
          confidence: 0.95,
          riskGrade: 'A',
          contractPeriod: '10 Years',
          paidPeriod: '5 Years',
          annualPayment: 3000,
          status: 'available' as const,
          seller: '0x1234...5678',
          listingDate: '2024-08-20'
        }
      ]);
    } finally {
      setIsLoadingListings(false);
    }
  }, [apiIntegration]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (appState.currentPage === 'buy') {
      loadListingData();
    }
  }, [appState.currentPage, loadListingData]);

  // 다국어 지원
  const t = {
    sell: "Sell Insurance",
    buy: "Buy Insurance", 
    inquiry: "Concierge",
    globalInsuranceRegistration: "Global Insurance Transfer Product Registration",
    insuranceInfo: "Insurance Information",
    insuranceCompany: "Insurance Company",
    selectCompany: "Select Company",
    productCategory: "Product Category",
    selectCategory: "Select Category",
    productName: "Product Name",
    enterProductName: "Enter product name",
    contractDate: "Contract Date",
    contractPeriod: "Contract Period",
    selectPeriod: "Select Period",
    actualPaymentPeriod: "Actual Payment Period",
    annualPayment: "Annual Payment (USD)",
    example: "e.g., 3000",
    totalPaid: "Total Paid Amount",
    submit: "Submit",
    globalInsuranceTransferProductSearch: "Global Insurance Transfer Product Search"
  };

  // 페이지별 props 준비
  const sellPageProps = {
    t,
    insuranceData: memoizedInsuranceData,
    setInsuranceData,
    handleRefChange,
    handleFinalChange,
    isAuthenticated: appState.isAuthenticated,
    isWeb3Connected,
    connectedAccount: appState.connectedAccount,
    tradeSteps,
    connectWalletWithAuth,
    isLoading: appState.isLoading,
    user: appState.user,
    autoRefundStatus,
    checkAutoRefundEligibility,
    handleSellSubmitWithStats,
    globalInsurers,
    globalCategories,
    contractPeriods,
    paidPeriods,
    calculatePaymentOptions,
    selectedFile,
    isUsingCamera,
    isOcrProcessing,
    ocrProgress,
    ocrResult,
    startCamera: () => {},
    stopCamera: () => {},
    capturePhoto: () => {},
    handleFileUpload: () => {},
    processOCR: () => {},
    fulfillmentData,
    isCrawling,
    fetchFulfillmentData,
    triggerCrawling
  };

  const buyPageProps = {
    t,
    insuranceData: memoizedInsuranceData,
    setInsuranceData,
    handleRefChange,
    handleFinalChange,
    isAuthenticated: appState.isAuthenticated,
    isWeb3Connected,
    connectedAccount: appState.connectedAccount,
    tradeSteps,
    connectWalletWithAuth,
    isLoading: appState.isLoading,
    user: appState.user,
    autoRefundStatus,
    checkAutoRefundEligibility,
    handleBuySubmitWithStats,
    globalInsurers,
    globalCategories,
    contractPeriods,
    paidPeriods,
    calculatePaymentOptions,
    changePage: appState.changePage,
    listingData,
    isLoadingListings
  };

  const inquiryPageProps = {
    t,
    handleInquirySubmit
  };

  const adminPageProps = {
    user: appState.user
  };

  return (
    <AppLayout
      currentPage={appState.currentPage}
      setCurrentPage={appState.setCurrentPage}
      currentLanguage={appState.currentLanguage}
      setCurrentLanguage={appState.setCurrentLanguage}
      isAuthenticated={appState.isAuthenticated}
      showAdminMenu={appState.showAdminMenu}
      handleGmailLogin={handleGmailLogin}
      t={t}
    >
      <PageRouter
        currentPage={appState.currentPage}
        sellPageProps={sellPageProps}
        buyPageProps={buyPageProps}
        inquiryPageProps={inquiryPageProps}
        adminPageProps={adminPageProps}
      />
    </AppLayout>
  );
}
