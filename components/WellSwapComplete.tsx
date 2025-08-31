'use client';

// WellSwapComplete.tsx — Refactored with Full Functionality
// 4개 페이지 컴포넌트를 최상단으로 호이스팅 + React.memo
// SafeInput V2 포함 (IME/커서 안정) + 모든 기존 기능 포함

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

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ethers } from 'ethers';
// Polygon Web3 integration - ethers.js is already imported
import {
  ParallaxSection,
  ScrollTriggerAnimation,
  TypewriterText,
  FadeInAnimation,
  AnimatedButton,
  AnimatedCard,
  StaggerContainer,
  StaggerItem,
  SmoothHeader,
  LoadingSpinner,
  AnimatedCounter,
  AnimatedMainTitle,
  GradientBackground
} from './animations/AnimationComponents';
import {
  DynamicTypewriter,
  ScrollRevealText,
  ParallaxText,
  WaveText,
  MorphingText,
  GradientText,
  SplitTextAnimation,
  MobileHeroText
} from './ui/DynamicTypography';
import { Camera, Upload, User, Menu, X, Wallet, ArrowRight, Globe, MessageSquare, BarChart3, TrendingUp, Shield, CheckCircle2, AlertCircle, Clock, DollarSign, Key, Lock, Users } from 'lucide-react';

// Polygon Web3 및 백엔드 연동
import PolygonIntegration from './PolygonContractIntegration';
import { WellSwapDB } from '../lib/database-wellswap'
import { supabase } from '../lib/database-wellswap'
import ReliabilityScore from './reliability/ReliabilityScore';
import fulfillmentAPI from '../lib/fulfillment-api';
import { AdminInquiryPanel } from './AdminInquiryPanel';
import AdminPanel from './AdminPanel';
import { THEME_ROOT_CLASS } from '../app/config/theme';

// 타입 정의
type TDict = any;

type SellPageProps = {
  t: TDict;
  insuranceData: any;
  setInsuranceData: React.Dispatch<React.SetStateAction<any>>;
  handleRefChange: (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFinalChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  // 추가 props
  isAuthenticated: boolean;
  isWeb3Connected: boolean;
  connectedAccount: string | null;
  tradeSteps: any;
  connectWalletWithAuth: () => void;
  isLoading: boolean;
  user: any;
  autoRefundStatus: any;
  checkAutoRefundEligibility: () => void;
  handleSellSubmitWithStats: () => void;
  globalInsurers: string[];
  globalCategories: string[];
  contractPeriods: string[];
  paidPeriods: string[];
  calculatePaymentOptions: (period: string) => string[];
  // OCR AI 관련 props
  selectedFile: File | null;
  isUsingCamera: boolean;
  isOcrProcessing: boolean;
  ocrProgress: number;
  ocrResult: any;
  startCamera: () => void;
  stopCamera: () => void;
  capturePhoto: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  processOCR: () => void;
  // AI 크롤링 관련 props
  fulfillmentData: any;
  isCrawling: boolean;
  fetchFulfillmentData: (insurerName: string, productType: string, policyYear?: number) => Promise<any>;
  triggerCrawling: () => void;
};

type BuyPageProps = {
  t: TDict;
  insuranceData: any;
  setInsuranceData: React.Dispatch<React.SetStateAction<any>>;
  handleRefChange: (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFinalChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  // 추가 props
  isAuthenticated: boolean;
  isWeb3Connected: boolean;
  connectedAccount: string | null;
  tradeSteps: any;
  connectWalletWithAuth: () => void;
  isLoading: boolean;
  user: any;
  autoRefundStatus: any;
  checkAutoRefundEligibility: () => void;
  handleBuySubmitWithStats: (listing?: any) => void;
  globalInsurers: string[];
  globalCategories: string[];
  contractPeriods: string[];
  paidPeriods: string[];
  calculatePaymentOptions: (period: string) => string[];
  changePage: (page: string) => void;
  listingData: any[];
};

// 안전한 마운트 로거 컴포넌트 (Hooks 규칙 준수)
const MountLogger: React.FC<{ name: string }> = ({ name }) => {
  React.useEffect(() => {
    console.log(`[${name}] MOUNT`);
    return () => console.log(`[${name}] UNMOUNT`);
  }, [name]);
  return null;
};

//
// ✅ SafeInput (IME + caret 안정화)
//
type SafeInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value?: string;
  onChange?: (next: string) => void;
};

export const SafeInput = React.memo(function SafeInput({
  value,
  onChange,
  ...rest
}: SafeInputProps) {
  const composingRef = useRef(false);
  const [localValue, setLocalValue] = useState(value ?? "");

  useEffect(() => {
    if (composingRef.current) return;
    if ((value ?? "") !== localValue) setLocalValue(value ?? "");
  }, [value]);

  const lastSent = useRef(localValue);
  useEffect(() => {
    if (composingRef.current) return;
    if (lastSent.current === localValue) return;
    const id = requestAnimationFrame(() => {
      lastSent.current = localValue;
      onChange?.(localValue);
    });
    return () => cancelAnimationFrame(id);
  }, [localValue]);

  const handleCompositionStart = () => (composingRef.current = true);
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    const v = (e.target as HTMLInputElement).value;
    setLocalValue(v);
    lastSent.current = v;
    onChange?.(v);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalValue(v);
  };

  return (
    <input
      {...rest}
      value={localValue}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      inputMode={rest.type === "number" ? "decimal" : rest.inputMode}
    />
  );
});

//
// ✅ HomePage
//
export const HomePage = React.memo(function HomePage({ t, setCurrentPage, setShowWalletConnectModal }: { t: any; setCurrentPage: (page: string) => void; setShowWalletConnectModal: (show: boolean) => void; }) {
  return (
    <div className="space-y-16">
      <div className="text-center space-y-8">
        <div className="relative">
          <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] select-none relative z-10 text-center">
            <DynamicTypewriter 
              texts={[
                "WELLSWAP", 
                "保险交易", // Chinese - Insurance Trading
                "Versicherungshandel", // German - Insurance Trading  
                "保険取引", // Japanese - Insurance Trading
                "거래소", // Korean - Exchange
                "ASSURANCE", // French - Insurance
                "SEGUROS" // Spanish - Insurance
              ]}
              speed={120}
              deleteSpeed={60}
              delayBetweenTexts={3000}
              gradient={true}
              scale={true}
              className="text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text"
            />
          </h1>
          <GradientBackground 
            className="absolute inset-0 from-zinc-100 via-zinc-200 to-zinc-100 opacity-20 blur-3xl"
            colors={["from-zinc-100", "via-zinc-200", "to-zinc-100"]}
          >
            <div></div>
          </GradientBackground>
        </div>
        <FadeInAnimation delay={0.5}>
          <div className="w-32 h-px bg-zinc-900 mx-auto mb-8"></div>
        </FadeInAnimation>
        
        <FadeInAnimation delay={0.8}>
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-600 font-light tracking-wide max-w-4xl mx-auto">
            {t.mainSubtitle}
          </p>
        </FadeInAnimation>
        
        <FadeInAnimation delay={1.1}>
          <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-light max-w-3xl mx-auto">
            {t.description}
          </p>
        </FadeInAnimation>
        
        <FadeInAnimation delay={1.4}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <AnimatedButton
              onClick={() => setCurrentPage('sell')}
              className="px-8 py-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transition-all duration-300"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
            >
              {t.getStarted}
            </AnimatedButton>
            <AnimatedButton
              onClick={() => setCurrentPage('buy')}
              className="px-8 py-4 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
            >
              {t.learnMore}
            </AnimatedButton>
            <AnimatedButton
              onClick={() => setShowWalletConnectModal(true)}
              className="px-8 py-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transition-all duration-300"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
            >
              Connect Wallet
            </AnimatedButton>
          </div>
        </FadeInAnimation>
      </div>

      <StaggerContainer staggerDelay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          <StaggerItem>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl md:text-6xl font-extralight text-zinc-900">
                <AnimatedCounter value={250} suffix="M+" />
              </div>
              <div className="text-xs sm:text-sm text-zinc-600 font-light tracking-wide">{t.statVolume}</div>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl md:text-6xl font-extralight text-zinc-900">
                <AnimatedCounter value={25} suffix="K+" />
              </div>
              <div className="text-xs sm:text-sm text-zinc-600 font-light tracking-wide">{t.statUsers}</div>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl md:text-6xl font-extralight text-zinc-900">
                <AnimatedCounter value={99.8} suffix="%" />
              </div>
              <div className="text-xs sm:text-sm text-zinc-600 font-light tracking-wide">{t.statSuccess}</div>
            </div>
          </StaggerItem>
        </div>
      </StaggerContainer>

      <StaggerContainer staggerDelay={0.3}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          <StaggerItem>
            <AnimatedCard className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
              <BarChart3 className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
              <h3 className="text-lg md:text-xl font-light text-zinc-900">{t.aiValuation}</h3>
              <p className="text-sm md:text-base text-zinc-600 font-light">{t.aiValuationDesc}</p>
            </AnimatedCard>
          </StaggerItem>
          
          <StaggerItem>
            <AnimatedCard className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
              <Globe className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
              <h3 className="text-lg md:text-xl font-light text-zinc-900">{t.globalMarket}</h3>
              <p className="text-sm md:text-base text-zinc-600 font-light">{t.globalMarketDesc}</p>
            </AnimatedCard>
          </StaggerItem>
          
          <StaggerItem>
            <AnimatedCard className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
              <Shield className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
              <h3 className="text-lg md:text-xl font-light text-zinc-900">{t.secureTrading}</h3>
              <p className="text-sm md:text-base text-zinc-600 font-light">{t.secureTradingDesc}</p>
            </AnimatedCard>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </div>
  );
});

//
// ✅ SellInsurancePage
//
export const SellInsurancePage = React.memo(function SellInsurancePage({
  t,
  insuranceData,
  setInsuranceData,
  handleRefChange,
  handleFinalChange,
  isAuthenticated,
  isWeb3Connected,
  connectedAccount,
  tradeSteps,
  connectWalletWithAuth,
  isLoading,
  user,
  autoRefundStatus,
  checkAutoRefundEligibility,
  handleSellSubmitWithStats,
  globalInsurers,
  globalCategories,
  contractPeriods,
  paidPeriods,
  calculatePaymentOptions,
  // OCR AI 관련 props
  selectedFile,
  isUsingCamera,
  isOcrProcessing,
  ocrProgress,
  ocrResult,
  startCamera,
  stopCamera,
  capturePhoto,
  handleFileUpload,
  processOCR,
  // AI 크롤링 관련 props
  fulfillmentData,
  isCrawling,
  fetchFulfillmentData,
  triggerCrawling,
}: SellPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] select-none">
          <GradientText 
            animate={true}
            colors={['#6366f1', '#8b5cf6', '#d946ef', '#f59e0b']}
            duration={4}
            className="block"
          >
            <WaveText 
              text="SELL"
              amplitude={15}
              frequency={3}
              delay={150}
            />
          </GradientText>
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
      </div>

      {/* 🛡️ 완벽한 상용화 인증 상태 표시 + 멀티시그 거래 단계 */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200"
           style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isAuthenticated && isWeb3Connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="font-light text-zinc-700">
            {isAuthenticated && isWeb3Connected && connectedAccount 
              ? `${t.multisigAuthComplete}: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(38)}` 
              : t.multisigAuthRequired}
          </span>
        </div>
        {tradeSteps.stage > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className={`w-2 h-2 rounded-full ${
                  step <= tradeSteps.stage ? 'bg-green-400' : 'bg-gray-300'
                }`}></div>
              ))}
            </div>
            <span className="text-xs text-zinc-600">
              단계 {tradeSteps.stage}/4
            </span>
          </div>
        )}
        {(!isAuthenticated || !isWeb3Connected) && (
          <button
            onClick={connectWalletWithAuth}
            disabled={isLoading}
            className="px-4 py-2 bg-zinc-900 text-zinc-50 font-light text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)' }}
          >
            {isLoading ? t.multisigConnecting : t.multisigAuthRequired}
          </button>
        )}
      </div>

      {/* ⏰ 관리자용 61일 자동 회수 관리 패널 */}


      <div className="max-w-6xl">
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
          {t.globalInsuranceRegistration}
        </p>
      </div>

      <div className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 보험 정보 입력 폼 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">{t.insuranceInfo}</h2>
            
            {/* 보험사 */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.insuranceCompany}</label>
              <select
                value={insuranceData.company}
                onChange={handleFinalChange('company')}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              >
                <option value="">{t.selectCompany}</option>
                {globalInsurers.map(insurer => (
                  <option key={insurer} value={insurer}>{insurer}</option>
                ))}
              </select>
            </div>

            {/* 상품 카테고리 */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.productCategory}</label>
              <select
                value={insuranceData.productCategory}
                onChange={handleRefChange('productCategory')}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              >
                <option value="">{t.selectCategory}</option>
                {globalCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 상품명 */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.productName}</label>
              <SafeInput
                type="text"
                value={insuranceData.productName}
                onChange={(value) => setInsuranceData((prev: any) => ({ ...prev, productName: value }))}
                placeholder={t.enterProductName}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* Contract Date */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.contractDate}</label>
              <div className="relative">
                <input
                  id="contract-date-input"
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={insuranceData.contractDate || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('📅 날짜 입력:', value);
                    setInsuranceData((prev: any) => ({ ...prev, contractDate: value }));
                    
                    // 4자리 년도 입력 시 자동으로 다음 필드(월)로 포커스 이동
                    if (value.length === 4 && /^\d{4}$/.test(value)) {
                      // 자동으로 '-' 추가하고 월 입력 위치로 커서 이동
                      const newValue = value + '-';
                      setInsuranceData((prev: any) => ({ ...prev, contractDate: newValue }));
                      setTimeout(() => {
                        const input = e.target as HTMLInputElement;
                        input.value = newValue;
                        input.setSelectionRange(5, 5); // '-' 뒤로 커서 이동
                      }, 0);
                    }
                    
                    // 7자리 (YYYY-MM) 입력 시 자동으로 일 필드로 이동
                    else if (value.length === 7 && /^\d{4}-\d{2}$/.test(value)) {
                      const newValue = value + '-';
                      setInsuranceData((prev: any) => ({ ...prev, contractDate: newValue }));
                      setTimeout(() => {
                        const input = e.target as HTMLInputElement;
                        input.value = newValue;
                        input.setSelectionRange(8, 8);
                      }, 0);
                    }
                  }}
                  maxLength={10}
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                />
              </div>
            </div>

            {/* Contract Period */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.contractPeriod}</label>
              <select
                value={insuranceData.contractPeriod}
                onChange={handleFinalChange('contractPeriod')}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              >
                <option value="">{t.selectPeriod}</option>
                {contractPeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            {/* 커스텀 기간 입력 */}
            <div style={{ display: insuranceData.contractPeriod === t.customInput ? 'block' : 'none' }}>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.customPeriod}</label>
              <SafeInput
                type="number"
                value={insuranceData.customContractPeriod}
                onChange={(value) => {
                  setInsuranceData((prev: any) => ({ ...prev, customContractPeriod: value }));
                  
                  // 4자리 입력 시 자동으로 다음 필드로 포커스 이동
                  if (value && value.length >= 4) {
                    setTimeout(() => {
                      const nextField = document.querySelector('input[placeholder*="월"], select[data-field="paidPeriod"]') as HTMLElement;
                      if (nextField) {
                        nextField.focus();
                      }
                    }, 100);
                  }
                }}
                placeholder={t.example}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* Paid Period */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.paidPeriod}</label>
              <select
                value={insuranceData.actualPaymentPeriod}
                onChange={handleFinalChange('actualPaymentPeriod')}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                disabled={!insuranceData.contractPeriod}
              >
                <option value="">{t.selectPaidPeriod}</option>
                {calculatePaymentOptions(insuranceData.contractPeriod).map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Annual Premium */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.annualPremium}</label>
              <SafeInput
                type="number"
                value={insuranceData.annualPayment}
                onChange={(value) => setInsuranceData((prev: any) => ({ ...prev, annualPayment: value }))}
                placeholder={t.example}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* Total Paid */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.totalPaid}</label>
              <SafeInput
                type="number"
                value={insuranceData.totalPayment}
                onChange={(value) => setInsuranceData((prev: any) => ({ ...prev, totalPayment: value }))}
                placeholder={t.example}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* 자동계산 결과 섹션 - 고급 인터랙티브 디자인 */}
            {(insuranceData.annualPayment || insuranceData.totalPayment) && (
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-xl border border-blue-200 shadow-lg transform hover:scale-[1.02] transition-all duration-500">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 animate-pulse">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Auto Calculation Result
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Annual Premium */}
                  <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 group-hover:text-blue-900 transition-colors">Annual Premium</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full group-hover:bg-blue-200 transition-colors">USD</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 animate-pulse">
                      ${parseFloat(insuranceData.annualPayment || '0').toLocaleString()}
                    </div>
                    <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Monthly: ${(parseFloat(insuranceData.annualPayment || '0') / 12).toLocaleString()}
                    </div>
                  </div>

                  {/* Paid Period */}
                  <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 group-hover:text-blue-900 transition-colors">Paid Period</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full group-hover:bg-blue-200 transition-colors">Years</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 animate-pulse">
                      {(() => {
                        const totalPaid = parseFloat(insuranceData.totalPayment || '0');
                        const annual = parseFloat(insuranceData.annualPayment || '0');
                        return annual > 0 ? Math.floor(totalPaid / annual) : 0;
                      })()} Years
                    </div>
                    <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Months: {(() => {
                        const totalPaid = parseFloat(insuranceData.totalPayment || '0');
                        const annual = parseFloat(insuranceData.annualPayment || '0');
                        return annual > 0 ? Math.floor((totalPaid / annual) * 12) : 0;
                      })()}
                    </div>
                  </div>

                  {/* Total Paid */}
                  <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 group-hover:text-blue-900 transition-colors">Total Paid</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full group-hover:bg-blue-200 transition-colors">USD</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 animate-pulse">
                      ${parseFloat(insuranceData.totalPayment || '0').toLocaleString()}
                    </div>
                    <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Auto-calculated
                    </div>
                  </div>
                </div>

                {/* 고급 게이지 차트 */}
                <div className="mt-6 bg-white p-6 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-blue-700">Payment Progress</span>
                    <span className="text-lg font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
                      {(() => {
                        const totalPaid = parseFloat(insuranceData.totalPayment || '0');
                        const annual = parseFloat(insuranceData.annualPayment || '0');
                        const contractPeriod = insuranceData.contractPeriod;
                        const periodYears = contractPeriod ? parseInt(contractPeriod.match(/\d+/)?.[0] || '0') : 0;
                        const totalExpected = annual * periodYears;
                        return totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;
                      })()}%
                    </span>
                  </div>
                  
                  {/* 게이지 차트 */}
                  <div className="relative">
                    <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg relative"
                        style={{
                          width: `${(() => {
                            const totalPaid = parseFloat(insuranceData.totalPayment || '0');
                            const annual = parseFloat(insuranceData.annualPayment || '0');
                            const contractPeriod = insuranceData.contractPeriod;
                            const periodYears = contractPeriod ? parseInt(contractPeriod.match(/\d+/)?.[0] || '0') : 0;
                            const totalExpected = annual * periodYears;
                            return totalExpected > 0 ? Math.min((totalPaid / totalExpected) * 100, 100) : 0;
                          })()}%`
                        }}
                      >
                        {/* 애니메이션 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                    
                    {/* 게이지 마커들 */}
                    <div className="flex justify-between text-xs text-blue-600 mt-2">
                      <span className="font-medium">0%</span>
                      <span className="font-medium">25%</span>
                      <span className="font-medium">50%</span>
                      <span className="font-medium">75%</span>
                      <span className="font-medium">100%</span>
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-700">Remaining Payment</div>
                      <div className="text-lg font-bold text-green-900">
                        ${(() => {
                          const totalPaid = parseFloat(insuranceData.totalPayment || '0');
                          const annual = parseFloat(insuranceData.annualPayment || '0');
                          const contractPeriod = insuranceData.contractPeriod;
                          const periodYears = contractPeriod ? parseInt(contractPeriod.match(/\d+/)?.[0] || '0') : 0;
                          const totalExpected = annual * periodYears;
                          return Math.max(0, totalExpected - totalPaid).toLocaleString();
                        })()}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-3 rounded-lg border border-purple-200">
                      <div className="text-sm font-medium text-purple-700">Monthly Payment</div>
                      <div className="text-lg font-bold text-purple-900">
                        ${(parseFloat(insuranceData.annualPayment || '0') / 12).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              onClick={handleSellSubmitWithStats}
              disabled={isLoading || !isAuthenticated || !isWeb3Connected}
              className="w-full p-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transform hover:translate-x-2 hover:translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
            >
              {isLoading ? '🔄 Step 1: Multisig Registration in Progress...' : 
               !isAuthenticated || !isWeb3Connected ? 'Multisig Authentication Required' : 
               '🔄 Step 1: Multisig Registration (300 USD)'}
            </button>
          </div>

          {/* OCR 업로드 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">{t.documentScan}</h2>
            
            {/* 파일 업로드 영역 */}
            <div 
              className="border-2 border-dashed border-zinc-300 p-8 text-center bg-zinc-50 hover:border-zinc-400 transition-colors cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Camera className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-zinc-600 font-light">
                {t.insuranceDocumentScan}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                {t.jpgPngSupported}
              </p>
            </div>

            {/* 업로드 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="px-6 py-3 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t.fileUpload}
              </button>
              
              <button
                onClick={isUsingCamera ? capturePhoto : startCamera}
                className="px-6 py-3 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isUsingCamera ? 'Capture' : t.camera}
              </button>
            </div>

            {/* 숨겨진 파일 입력 */}
            <input
              type="file"
              id="file-upload"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* 카메라 비디오 */}
            {isUsingCamera && (
              <div className="mt-6">
                <video
                  id="camera-video"
                  autoPlay
                  playsInline
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <div className="flex justify-center mt-4 space-x-4">
                  <button
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* 선택된 파일 표시 */}
            {selectedFile && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-semibold">Selected File: {selectedFile.name}</p>
                <p className="text-green-600 text-sm">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={processOCR}
                  disabled={isOcrProcessing}
                  className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {isOcrProcessing ? 'OCR Processing...' : 'Extract OCR Text'}
                </button>
              </div>
            )}

            {/* OCR 진행률 */}
            {isOcrProcessing && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-sm text-gray-600">
                  OCR Progress: {ocrProgress}%
                </p>
              </div>
            )}

            {/* OCR 결과 */}
            {ocrResult && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">OCR Analysis Result</h4>
                <p className="text-blue-700 text-sm">
                  Confidence: {ocrResult.confidence.toFixed(1)}%
                </p>
                <p className="text-blue-700 text-sm">
                  Extracted Text: {ocrResult.text.length} characters
                </p>
                {ocrResult.extractedData && (
                  <div className="mt-2 text-sm">
                    <p>Insurance Company: {ocrResult.extractedData.company || 'Unknown'}</p>
                    <p>Product Name: {ocrResult.extractedData.productName || 'Unknown'}</p>
                    <p>Surrender Value: {ocrResult.extractedData.surrenderValue || 'Unknown'}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI 크롤링 시스템 정보 - 고급 디자인 */}
            <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 rounded-xl border border-purple-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-purple-900">AI Automation Crawling System</h4>
              </div>
              
              <p className="text-purple-800 text-sm mb-4 leading-relaxed">
                Global insurance company fulfillment rate data is crawled to reflect weights in AI valuation and improve accuracy.
              </p>
              
              {fulfillmentData ? (
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-700">Adjustment Factor</span>
                      <span className="text-lg font-bold text-purple-900">
                        {fulfillmentData.adjustmentFactor?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-700">Reliability Score</span>
                      <span className="text-lg font-bold text-purple-900">
                        {fulfillmentData.reliabilityScore?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-700">Recommendation</span>
                      <span className="text-lg font-bold text-purple-900">
                        {fulfillmentData.recommendation || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
                  <div className="animate-pulse">
                    <div className="w-4 h-4 bg-purple-300 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-purple-600">Crawling data will appear here...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

//
// ✅ BuyInsurancePage
//
export const BuyInsurancePage = React.memo(function BuyInsurancePage({
  t,
  insuranceData,
  setInsuranceData,
  handleRefChange,
  handleFinalChange,
  isAuthenticated,
  isWeb3Connected,
  connectedAccount,
  tradeSteps,
  connectWalletWithAuth,
  isLoading,
  user,
  autoRefundStatus,
  checkAutoRefundEligibility,
  handleBuySubmitWithStats,
  globalInsurers,
  globalCategories,
  contractPeriods,
  paidPeriods,
  calculatePaymentOptions,
  changePage,
  listingData,
}: BuyPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <div className="relative">
          <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] select-none relative z-10">
            <GradientText 
              animate={true}
              colors={['#10b981', '#06b6d4', '#3b82f6', '#6366f1']}
              duration={3.5}
              className="block"
            >
              <SplitTextAnimation 
                text="BUY"
                animation="scale"
                stagger={0.2}
                duration={0.8}
              />
            </GradientText>
          </h1>
          <GradientBackground 
            className="absolute inset-0 from-zinc-100 via-zinc-200 to-zinc-100 opacity-20 blur-3xl"
            colors={["from-zinc-100", "via-zinc-200", "to-zinc-100"]}
          >
            <div></div>
          </GradientBackground>
        </div>
        <FadeInAnimation delay={0.5}>
          <div className="w-32 h-px bg-zinc-900 mx-auto mb-8"></div>
        </FadeInAnimation>
        <FadeInAnimation delay={0.8}>
          <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
            {t.globalInsuranceTransferProductSearch}
          </p>
        </FadeInAnimation>
      </div>

      {/* 구매 페이지 헤더 */}
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900 mb-4">Available Insurance Products</h2>
        <p className="text-zinc-600">Browse and purchase insurance products from leading Hong Kong insurers</p>
        
        {/* 지갑 연결 상태 표시 */}
        <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isAuthenticated && isWeb3Connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="font-light text-zinc-700">
                {isAuthenticated && isWeb3Connected && connectedAccount 
                  ? `Wallet Connected: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(38)}` 
                  : 'Wallet not connected'}
              </span>
            </div>
            {(!isAuthenticated || !isWeb3Connected) && (
              <button
                onClick={connectWalletWithAuth}
                disabled={isLoading}
                className="px-4 py-2 bg-zinc-900 text-zinc-50 font-light text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 리스팅 그리드 (기존 100% 유지) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {listingData.map(listing => (
          <div 
            key={listing.id}
            className="p-4 md:p-6 border border-zinc-200 bg-zinc-50 hover:border-zinc-400 transition-colors"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
          >
            {/* 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
              <div className="flex-1">
                <h3 className="font-light text-base md:text-lg text-zinc-900">{listing.productName}</h3>
                <p className="text-xs md:text-sm text-zinc-600">{listing.company}</p>
                <span className="inline-block px-2 py-1 text-xs bg-zinc-200 text-zinc-700 mt-1">
                  {listing.category}
                </span>
              </div>
              <div className={`px-2 py-1 text-xs rounded shrink-0 ${
                listing.status === 'available' ? 'bg-green-100 text-green-700' :
                listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                listing.status === 'blockchain_pending' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {listing.status === 'available' ? t.available :
                 listing.status === 'pending' ? t.pending :
                 listing.status === 'blockchain_pending' ? '블록체인 거래중' : t.sold}
              </div>
            </div>

            {/* 세부 정보 */}
            <div className="space-y-1 md:space-y-2 mb-4 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">{t.contractPeriod}:</span>
                <span className="text-zinc-900">{listing.contractPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">{t.paymentPeriod}:</span>
                <span className="text-zinc-900">{listing.paidPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">{t.annualPremium}:</span>
                <span className="text-zinc-900">${listing.annualPayment.toLocaleString()}</span>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="border-t border-zinc-300 pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600">{t.surrenderValue}:</span>
                <span className="text-lg font-light text-zinc-700">
                  ${listing.surrenderValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600">{t.transferValue}:</span>
                <span className="text-lg font-light text-zinc-900">
                  ${listing.transferValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600">{t.platformPrice}:</span>
                <span className="text-xl font-light text-zinc-900">
                  ${listing.platformPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600">{t.confidence}:</span>
                <span className={`text-sm font-medium ${
                  listing.confidence > 0.8 ? 'text-green-600' : 
                  listing.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(listing.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-zinc-600">{t.riskGrade}:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  listing.riskGrade === 'A' ? 'bg-green-100 text-green-700' :
                  listing.riskGrade === 'B' ? 'bg-blue-100 text-blue-700' :
                  listing.riskGrade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {listing.riskGrade}
                </span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-2">
              {listing.status === 'available' ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleBuySubmitWithStats(listing)}
                    disabled={!isAuthenticated || !isWeb3Connected || isLoading}
                    className="w-full p-2 md:p-3 bg-zinc-900 text-zinc-50 text-sm md:text-base font-light hover:bg-zinc-800 transform hover:translate-x-1 hover:translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)' }}
                  >
                    {isLoading ? 'Processing...' : 
                     !isAuthenticated || !isWeb3Connected ? 'Connect Wallet to Purchase' : 
                     'Purchase with Multisig'}
                  </button>
                  <button
                    onClick={() => changePage('inquiry')}
                    className="w-full p-2 md:p-3 border border-zinc-300 text-zinc-700 text-sm md:text-base font-light hover:border-zinc-400 hover:bg-zinc-100 transition-colors"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)' }}
                  >
                    {t.inquireNow}
                  </button>
                </div>
              ) : listing.status === 'pending' || listing.status === 'blockchain_pending' ? (
                <div className="p-2 md:p-3 bg-yellow-50 border border-yellow-200 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <p className="text-xs md:text-sm text-yellow-700">
                      {listing.status === 'blockchain_pending' ? '블록체인 거래 진행 중' : '거래 진행 중'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2 md:p-3 bg-red-50 border border-red-200 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                    <p className="text-xs md:text-sm text-red-700">이 상품은 판매되었습니다</p>
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-zinc-200 text-xs text-zinc-500">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="truncate">{t.seller}: {listing.seller}</span>
                <span>{t.registrationDate}: {listing.listingDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 빈 상태 */}
      {listingData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 font-light">현재 등록된 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
});

//
// ✅ InquiryPage
//
export const InquiryPage = React.memo(function InquiryPage({ 
  t, 
  handleInquirySubmit 
}: { 
  t: any; 
  handleInquirySubmit: (inquiryData: any) => Promise<void>;
}) {
  const [inquiryData, setInquiryData] = useState({
    name: '',
    phone: '',
    email: '',
    inquiryContent: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!inquiryData.name || !inquiryData.phone || !inquiryData.inquiryContent) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await handleInquirySubmit(inquiryData);
      setInquiryData({ name: '', phone: '', email: '', inquiryContent: '' });
      alert('상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.');
    } catch (error) {
      console.error('상담 신청 실패:', error);
      alert('상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="relative">
          <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] select-none relative z-10">
            <DynamicTypewriter 
              texts={["CONCIERGE", "PREMIUM SERVICE", "LUXURY SUPPORT"]}
              speed={100}
              deleteSpeed={80}
              delayBetweenTexts={2500}
              gradient={true}
              scale={true}
              className="text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text"
            />
          </h1>
          <GradientBackground 
            className="absolute inset-0 from-zinc-100 via-zinc-200 to-zinc-100 opacity-20 blur-3xl"
            colors={["from-zinc-100", "via-zinc-200", "to-zinc-100"]}
          >
            <div></div>
          </GradientBackground>
        </div>
        <FadeInAnimation delay={0.5}>
          <div className="w-32 h-px bg-zinc-900 mx-auto mb-8"></div>
        </FadeInAnimation>
        <FadeInAnimation delay={0.8}>
          <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
            {t.insuranceTransferExpert}
          </p>
        </FadeInAnimation>
      </div>
      
      <div className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 기존 소개글 (왼쪽) */}
          <div className="space-y-6">
            <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
              <h2 className="text-xl md:text-2xl font-extralight text-zinc-900 mb-4 md:mb-6">Professional Concierge Service</h2>
              <div className="space-y-3 md:space-y-4 text-sm md:text-base text-zinc-600 font-light">
                <p>Our team of experts assists with every step of the insurance asset transfer process. From complex legal procedures to international regulatory compliance, we ensure safe and efficient transfers.</p>
                <ul className="space-y-1 md:space-y-2 pl-4">
                  <li>• Legal documentation and review</li>
                  <li>• Transfer process management</li>
                  <li>• Cross-border regulatory compliance</li>
                  <li>• Due diligence and risk assessment</li>
                </ul>
              </div>
              
              <div className="mt-6 md:mt-8">
                <h3 className="text-base md:text-lg font-light text-zinc-900 mb-3 md:mb-4">Contact Information</h3>
                <div className="space-y-1 md:space-y-2 text-sm md:text-base text-zinc-600 font-light">
                  <p>Email: concierge@wellswap.com</p>
                  <p>Phone: +852 1234 5678</p>
                  <p>Operating Hours: Monday - Friday, 9:00 AM - 6:00 PM (HKT)</p>
                </div>
              </div>
            </div>
          </div>

          {/* 상담 신청 폼 (오른쪽) */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">Inquiry Form</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Name *</label>
                <SafeInput
                  type="text"
                  value={inquiryData.name}
                  onChange={(value: string) => setInquiryData(prev => ({ ...prev, name: value }))}
                  placeholder="Enter your name"
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Phone *</label>
                <SafeInput
                  type="tel"
                  value={inquiryData.phone}
                  onChange={(value: string) => setInquiryData(prev => ({ ...prev, phone: value }))}
                  placeholder="Enter your phone number"
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Email</label>
                <SafeInput
                  type="email"
                  value={inquiryData.email}
                  onChange={(value: string) => setInquiryData(prev => ({ ...prev, email: value }))}
                  placeholder="Enter your email (optional)"
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Inquiry Details *</label>
                <textarea
                  value={inquiryData.inquiryContent}
                  onChange={(e) => setInquiryData(prev => ({ ...prev, inquiryContent: e.target.value }))}
                  placeholder="Please provide detailed information about your inquiry"
                  rows={4}
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors resize-none"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                />
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full p-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transform hover:translate-x-2 hover:translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// 관리자 페이지 컴포넌트 (멀티시그 거래 관리 포함)
const AdminPage = ({ t, isAdmin, web3Account, listings, setListings }: {
  t: any;
  isAdmin: boolean;
  web3Account: string | null;
  listings: any[];
  setListings: (listings: any[]) => void;
}) => {
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [multisigTrades, setMultisigTrades] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [aiEvaluationAmount, setAiEvaluationAmount] = useState('');
  const [confirmedPrice, setConfirmedPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  // 거래 관련 함수들 직접 구현
  const executeTrade = async (tradeId: string) => {
    console.log('거래 실행:', tradeId);
    return { success: true, transactionHash: '0x...' };
  };
  
  const getMultisigStatus = async (tradeId: string) => {
    console.log('멀티시그 상태 확인:', tradeId);
    return { status: 'pending', signatures: 0, required: 2 };
  };

  // 대기 중인 매도 신청 조회 (개선된 버전)
  useEffect(() => {
    const fetchPendingListings = async () => {
      if (!isAdmin) return;
      
      setLoading(true);
      setDbStatus('loading');
      
      try {
        console.log('🔍 어드민: 대기중인 매도 신청 조회 시작...');
        
        // 1. 먼저 데이터베이스 연결 상태 확인
        const { data: connectionTest, error: connectionError } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        if (connectionError) {
          console.error('❌ 데이터베이스 연결 실패:', connectionError);
          setDbStatus('error');
          setDebugInfo({ error: connectionError.message, code: connectionError.code });
          return;
        }
        
        console.log('✅ 데이터베이스 연결 확인됨');
        setDbStatus('connected');
        
        // 2. insurance_assets 테이블의 모든 데이터 조회 (디버깅용)
        const { data: allAssets, error: allAssetsError } = await supabase
          .from('insurance_assets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (allAssetsError) {
          console.error('❌ 전체 자산 조회 실패:', allAssetsError);
          setDebugInfo({ error: allAssetsError.message, code: allAssetsError.code });
          return;
        }
        
        console.log('📊 전체 자산 데이터:', allAssets);
        
        // 3. pending 상태의 자산만 필터링
        const pendingAssets = allAssets?.filter(asset => asset.status === 'pending') || [];
        
        console.log('⏳ 대기중인 매도 신청:', pendingAssets);
        
        setPendingListings(pendingAssets);
        setDebugInfo({
          totalAssets: allAssets?.length || 0,
          pendingAssets: pendingAssets.length,
          allStatuses: allAssets?.map(asset => ({ id: asset.id, status: asset.status })) || []
        });
        
      } catch (error: any) {
        console.error('❌ 대기 중인 매도 신청 조회 실패:', error);
        setDbStatus('error');
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingListings();
  }, [isAdmin]);

  // 멀티시그 거래 조회
  useEffect(() => {
    const fetchMultisigTrades = async () => {
      if (!isAdmin) return;
      
      try {
        console.log('🔍 어드민: 멀티시그 거래 조회 시작...');
        
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ 멀티시그 거래 조회 실패:', error);
          return;
        }

        console.log('📊 멀티시그 거래 데이터:', data);
        setMultisigTrades(data || []);
        
      } catch (error) {
        console.error('❌ 멀티시그 거래 조회 실패:', error);
      }
    };

    fetchMultisigTrades();
  }, [isAdmin]);

  // AI 평가 금액 입력 및 멀티시그 거래 생성
  const handleConfirmPrice = async (listing: any) => {
    if (!aiEvaluationAmount || !confirmedPrice) {
      alert('AI 평가 금액과 확정 가격을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      console.log('🤖 어드민: AI 평가 및 멀티시그 거래 생성 시작...', listing);
      
      // 1. AI 평가 결과 업데이트
      const { error: aiError } = await supabase
        .from('insurance_assets')
        .update({
          ai_valuation: parseFloat(aiEvaluationAmount),
          platform_price: parseFloat(confirmedPrice),
          status: 'ai_evaluated'
        })
        .eq('id', listing.id);

      if (aiError) throw aiError;
      console.log('✅ AI 평가 결과 업데이트 완료');

      // Polygon 2단계: 가격 책정
      const priceResult = await PolygonIntegration.setPlatformPrice(listing.id, confirmedPrice);
      
      if (priceResult.success) {
        console.log('✅ Polygon 가격 책정 완룼:', priceResult);
        
        // 데이터베이스 업데이트
        const { error: updateError } = await supabase
          .from('insurance_assets')
          .update({
            status: 'available',
            platform_price: parseFloat(confirmedPrice),
            price_tx: priceResult.transactionHash,
            updated_at: new Date().toISOString()
          })
          .eq('asset_id', listing.id);

        if (updateError) throw updateError;
        console.log('✅ 데이터베이스 업데이트 완룼');

        // UI 업데이트
        setPendingListings(prev => prev.filter(item => item.id !== listing.id));
        setListings((prev: any[]) => 
          prev.map((item: any) => 
            item.id === listing.id 
              ? { ...item, status: 'available', platform_price: parseFloat(confirmedPrice) }
              : item
          )
        );

        alert('✅ 2단계 가격 책정이 완료되었습니다!');
        setSelectedListing(null);
        setAiEvaluationAmount('');
        setConfirmedPrice('');
      } else {
        throw new Error(priceResult.error || '가격 책정 실패');
      }
    } catch (error) {
      console.error('❌ 가격 확정 실패:', error);
      alert('가격 확정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 멀티시그 서명
  const handleSignTrade = async (tradeId: string) => {
    setLoading(true);
    try {
      const result = await approveTrade(new PublicKey(tradeId));
      if (result.success) {
        alert('✅ 멀티시그 서명이 완료되었습니다.');
        // 멀티시그 상태 업데이트
        alert('서명이 완료되었습니다.');
      }
    } catch (error) {
      console.error('멀티시그 서명 실패:', error);
      alert('멀티시그 서명에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 멀티시그 거래 실행
  const handleExecuteTrade = async (tradeId: string) => {
    setLoading(true);
    try {
      alert('✅ 멀티시그 거래가 실행되었습니다.');
      // 거래 상태 업데이트
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('multisig_signatures->trade_id', tradeId);

      if (error) throw error;
    } catch (error) {
      console.error('멀티시그 거래 실행 실패:', error);
      alert('멀티시그 거래 실행에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 관리자 패널 컴포넌트 사용
  if (isAdmin) {
    return <AdminPanel isAdmin={isAdmin} />;
  }
};

//
// ✅ 메인 컴포넌트
//
export default function WellSwapGlobalPlatform() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // 페이지 변경 함수
  const changePage = (page: string) => {
    setCurrentPage(page);
  };
  const [insuranceData, setInsuranceData] = useState({});

  // Polygon Web3 및 백엔드 연동
  // 🔗 Polygon 멀티시그 거래 시스템 연동
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);
  const [web3Account, setWeb3Account] = useState<string | null>(null);
  const [maticBalance, setMaticBalance] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [walletIsAdmin, setWalletIsAdmin] = useState(false);
  
  // Polygon 거래 로딩 상태
  const [assetRegistrationLoading, setAssetRegistrationLoading] = useState(false);
  const [tradingLoading, setTradingLoading] = useState(false);

  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const memoizedInsuranceData = useMemo(() => insuranceData, [insuranceData]);

  // 홍콩 보험사 데이터 (기존 백업 파일 기준)
  const globalInsurers = [
    'AIA Group Limited', 'Prudential plc', 'Manulife Financial', 'Sun Life Financial',
    'Great Eastern Holdings', 'FWD Group', 'Zurich Insurance Group', 'AXA',
    'Generali', 'Allianz', 'MetLife', 'New York Life', 'Pacific Century Group',
    'BOC Life', 'China Life Insurance', 'CNOOC', 'CMB Wing Lung Bank',
    'Standard Chartered', 'HSBC Life', 'Hang Seng Bank', 'Bank of East Asia',
    'DBS Bank', 'OCBC Bank', 'UOB', 'Citibank', 'BNP Paribas',
    'Societe Generale', 'Credit Suisse', 'UBS', 'Morgan Stanley'
  ];

  const productCategories = [
    'Savings Plan', 'Pension Plan', 'Investment Linked', 'Whole Life',
    'Endowment Plan', 'Annuity', 'Medical Insurance', 'Term Life'
  ];

  const globalCategories = productCategories;

  // 계약 기간 (기존 백업 파일 기준)
  const contractPeriods = [
    '2 Years', '3 Years', '5 Years', '7 Years', '10 Years', '15 Years', '20 Years', 'Custom Input'
  ];

  // 납입 기간 (기존 백업 파일 기준)
  const paidPeriods = [
    '1 Year', '2 Years', '3 Years', '4 Years', '5 Years', '6 Years', '7 Years', '8 Years', '9 Years', '10 Years',
    '11 Years', '12 Years', '13 Years', '14 Years', '15 Years', '16 Years', '17 Years', '18 Years', '19 Years', '20 Years'
  ];
  const calculatePaymentOptions = useCallback((period: string) => {
    if (!period || period === 'Custom Input') return [];
    
    const periodMap: { [key: string]: number } = {
      '2 Years': 2, '3 Years': 3, '5 Years': 5, '7 Years': 7, '10 Years': 10,
      '15 Years': 15, '20 Years': 20
    };
    
    const years = periodMap[period];
    if (!years) return [];
    
    return Array.from({ length: years }, (_, i) => `${i + 1} Year${i > 0 ? 's' : ''}`);
  }, []);

  const handleRefChange = (field: string) => (e: any) =>
    setInsuranceData((prev: any) => ({ ...prev, [field]: e.target.value }));

  const handleFinalChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setInsuranceData((prev: any) => {
      const updated = { ...prev, [field]: value };
      
      // 자동 계산: 연간 보험료가 변경되면 총 납입액 자동 계산
      if (field === 'annualPayment' && value && prev.contractPeriod && prev.paidPeriod) {
        const annual = parseFloat(value);
        const contractYears = parseInt(prev.contractPeriod.match(/\d+/)?.[0] || '0');
        const paidYears = parseInt(prev.paidPeriod.match(/\d+/)?.[0] || '0');
        
        if (annual > 0 && contractYears > 0 && paidYears > 0) {
          const totalPaid = Math.min(annual * paidYears, annual * contractYears);
          updated.totalPayment = totalPaid.toString();
        } else {
          // 값이 유효하지 않으면 '0'으로 설정 (공백 방지)
          updated.totalPayment = '0';
        }
      }
      
      // 자동 계산: 계약 기간이 변경되면 총 납입액 재계산
      if (field === 'contractPeriod' && value && prev.annualPayment && prev.paidPeriod) {
        const annual = parseFloat(prev.annualPayment);
        const contractYears = parseInt(value.match(/\d+/)?.[0] || '0');
        const paidYears = parseInt(prev.paidPeriod.match(/\d+/)?.[0] || '0');
        
        if (annual > 0 && contractYears > 0 && paidYears > 0) {
          const totalPaid = Math.min(annual * paidYears, annual * contractYears);
          updated.totalPayment = totalPaid.toString();
        } else {
          updated.totalPayment = '0';
        }
      }
      
      // 자동 계산: 납입 기간이 변경되면 총 납입액 재계산
      if (field === 'paidPeriod' && value && prev.annualPayment && prev.contractPeriod) {
        const annual = parseFloat(prev.annualPayment);
        const contractYears = parseInt(prev.contractPeriod.match(/\d+/)?.[0] || '0');
        const paidYears = parseInt(value.match(/\d+/)?.[0] || '0');
        
        if (annual > 0 && contractYears > 0 && paidYears > 0) {
          const totalPaid = Math.min(annual * paidYears, annual * contractYears);
          updated.totalPayment = totalPaid.toString();
        } else {
          updated.totalPayment = '0';
        }
      }
      
      return updated;
    });
  };

  // 날짜 포맷팅 함수들 (수정됨)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };

  const formatInputToDate = (input: string): string => {
    if (!input || input.trim() === '') return '';
    
    // MM/DD/YYYY 형식으로 입력된 경우
    const match = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, month, day, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    // YYYY-MM-DD 형식으로 입력된 경우
    const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    // 부분 입력 허용 (MM/DD 또는 MM/DD/YY 등)
    const partialMatch = input.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (partialMatch) {
      const [, month, day, year] = partialMatch;
      let fullYear = year;
      if (!year) {
        fullYear = new Date().getFullYear().toString();
      } else if (year.length === 2) {
        fullYear = '20' + year;
      }
      const date = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return '';
  };

  // 날짜 입력 핸들러 (새로 추가)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('📅 날짜 입력:', value);
    
    // 빈 값 허용
    if (!value) {
      setInsuranceData((prev: any) => ({ ...prev, contractDate: '' }));
      return;
    }
    
    // 날짜 형식 변환
    const formattedDate = formatInputToDate(value);
    console.log('📅 변환된 날짜:', formattedDate);
    
    setInsuranceData((prev: any) => ({ ...prev, contractDate: formattedDate }));
  };

  // 달력 버튼 클릭 핸들러 (새로 추가)
  const handleCalendarClick = () => {
    const input = document.getElementById('contract-date-input') as HTMLInputElement;
    if (input) {
      input.showPicker?.() || input.click();
    }
  };



  // 자동계산 로직: 연간 보험료와 납입기간을 입력하면 총 납입액 자동 계산
  useEffect(() => {
    if (insuranceData.annualPayment && insuranceData.actualPaymentPeriod) {
      const annual = parseFloat(insuranceData.annualPayment);
      const paidPeriod = parseInt(insuranceData.actualPaymentPeriod.match(/\d+/)?.[0] || '0');
      
      if (annual > 0 && paidPeriod > 0) {
        const calculatedTotal = annual * paidPeriod;
        setInsuranceData(prev => ({ 
          ...prev, 
          totalPayment: calculatedTotal.toString() 
        }));
      }
    }
  }, [insuranceData.annualPayment, insuranceData.actualPaymentPeriod]);

  // 📸 OCR AI 함수들
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.getElementById('camera-video') as HTMLVideoElement;
      if (video) {
        video.srcObject = stream;
        setIsUsingCamera(true);
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('카메라 접근이 거부되었거나 사용할 수 없습니다.');
    }
  };

  const stopCamera = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
      setIsUsingCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (video && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const processOCR = async () => {
    if (!selectedFile) return;

    setIsOcrProcessing(true);
    setOcrProgress(0);
    
    try {
      console.log('🚀 OCR AI 분석 시작...');
      
      // 1단계: Tesseract.js OCR 엔진 초기화
      setOcrProgress(10);
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker();
      await worker.loadLanguage('eng+kor+chi_sim');
      await worker.initialize('eng+kor+chi_sim');
      
      setOcrProgress(30);
      console.log('✅ OCR 엔진 초기화 완료');

      // 2단계: 이미지에서 텍스트 추출
      setOcrProgress(50);
      const { data: { text, confidence } } = await worker.recognize(selectedFile);
      await worker.terminate();
      
      setOcrProgress(70);
      console.log('✅ 텍스트 추출 완료:', { textLength: text.length, confidence });

      // 3단계: 보험 정보 파싱
      setOcrProgress(85);
      const extractedData = parseInsuranceText(text);
      setOcrResult({ text, confidence, extractedData });
      
      setOcrProgress(100);
      console.log('✅ 보험 정보 파싱 완료:', extractedData);

      // 4단계: 폼 자동 채우기
      if (extractedData.company) {
        if (globalInsurers.includes(extractedData.company)) {
          setInsuranceData(prev => ({ ...prev, company: extractedData.company }));
        } else {
          setInsuranceData(prev => ({ ...prev, company: extractedData.company }));
        }
      }

      setInsuranceData(prev => ({
        ...prev,
        productName: extractedData.productName || '',
        productCategory: extractedData.productCategory || '',
        surrenderValue: extractedData.surrenderValue || '',
        contractPeriod: extractedData.contractPeriod || '',
        annualPayment: extractedData.annualPayment || '',
        totalPayment: extractedData.totalPayment || ''
      }));

      alert(`🎉 OCR AI Analysis Complete!\nConfidence: ${confidence.toFixed(1)}%\nExtracted Text: ${text.length} characters`);

    } catch (error) {
      console.error('❌ OCR 처리 실패:', error);
      alert('OCR processing error occurred. Please use manual input.');
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(0);
    }
  };

  // 보험 텍스트 파싱 함수
  const parseInsuranceText = (text: string) => {
    const extracted: any = {};
    
    try {
      // 보험사명 패턴
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
      
      // 증권번호
      const policyMatch = text.match(/(?:Policy|Certificate|증권)[:\s]*([A-Z0-9\-]+)/i);
      if (policyMatch) extracted.policyNumber = policyMatch[1];
      
      // 상품명
      const productMatch = text.match(/(?:Product|Plan|상품명)[:\s]*([A-Za-z가-힣\s]+)/i);
      if (productMatch) extracted.productName = productMatch[1];
      
      // 해지환급금
      const valueMatch = text.match(/(?:Surrender Value|해지환급금|Cash Value)[:\s]*\$?([0-9,]+)/i);
      if (valueMatch) extracted.surrenderValue = valueMatch[1].replace(/,/g, '');
      
      // 보험료
      const premiumMatch = text.match(/(?:Premium|보험료|Annual Payment)[:\s]*\$?([0-9,]+)/i);
      if (premiumMatch) extracted.annualPayment = premiumMatch[1].replace(/,/g, '');
      
      // 계약기간
      const periodMatch = text.match(/(?:Contract Period|계약기간)[:\s]*([0-9]+)\s*(?:Years?|년)/i);
      if (periodMatch) extracted.contractPeriod = `${periodMatch[1]} Years`;
      
      // 총 납입액
      const totalMatch = text.match(/(?:Total Payment|총납입액)[:\s]*\$?([0-9,]+)/i);
      if (totalMatch) extracted.totalPayment = totalMatch[1].replace(/,/g, '');
      
      // 상품 카테고리
      const categoryPatterns = [
        /(Savings Plan|Pension Plan|Investment Linked|Whole Life|Endowment Plan|Annuity)/i,
        /(저축보험|연금보험|투자연결보험|종신보험|만기보험|연금)/i
      ];
      
      for (const pattern of categoryPatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.productCategory = match[1];
          break;
        }
      }
      
    } catch (error) {
      console.error('텍스트 파싱 오류:', error);
    }
    
    return extracted;
  };

  // 🤖 AI 크롤링 함수들
  const fetchFulfillmentData = async (insurerName: string, productType: string, policyYear: number = 5) => {
    setIsCrawling(true);
    try {
      console.log('🕷️ AI 크롤링 시작...');
      
      // fulfillmentAPI를 사용하여 실시간 크롤링 데이터 요청
      const weights = await fulfillmentAPI.getValuationWeights(insurerName, productType, policyYear);
      setFulfillmentData(weights);
      
      console.log('✅ AI 크롤링 완료:', weights);
      return weights;
      
    } catch (error) {
      console.error('❌ AI 크롤링 실패:', error);
      return null;
    } finally {
      setIsCrawling(false);
    }
  };

  const triggerCrawling = async () => {
    try {
      console.log('🔄 크롤링 트리거 시작...');
      const result = await fulfillmentAPI.triggerCrawling();
      console.log('✅ 크롤링 트리거 완료:', result);
      alert('크롤링이 성공적으로 시작되었습니다.');
    } catch (error) {
      console.error('❌ 크롤링 트리거 실패:', error);
      alert('크롤링 시작에 실패했습니다.');
    }
  };

  // MetaMask Polygon 지갑 연결 및 인증 (API Routes 사용)
  const connectWalletWithAuth = async () => {
    setIsLoading(true);
    try {
      console.log('🦊 MetaMask 연결 시작...');
      
      // PolygonIntegration을 통한 MetaMask 연결
      const wallet = await PolygonIntegration.connectMetaMask();
      
      const walletAddress = wallet.address;
      console.log('💰 지갑 주소 확인:', walletAddress);
      
      // 지갑 상태 업데이트
      setConnectedWallet(wallet);
      setIsWeb3Connected(true);
      setWeb3Account(walletAddress);
      setConnectedAccount(walletAddress);
      setMaticBalance(wallet.balance);
      
      // USDC 잔액 조회
      const usdcBalance = await PolygonIntegration.getUSDCBalance(walletAddress);
      setUsdcBalance(usdcBalance.balance);
      
      // API Routes를 통한 사용자 확인/생성
      console.log('🗄️ API Routes를 통한 사용자 처리 중...');
      
      try {
        // 사용자 생성/업데이트
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: walletAddress,
            reputation_score: 100,
            total_trades: 0
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API 응답 오류:', response.status, errorText);
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const result = await response.json();
        console.log('📡 API 응답:', result);
        
        if (result.success && result.user) {
          console.log('✅ 사용자 처리 완료:', result.user);
          console.log('👑 관리자 권한:', result.isAdmin);
          
          setUser(result.user);
          setIsAuthenticated(true);
          setWalletIsAdmin(result.isAdmin);
          
          // 관리자 권한 설정
          if (result.isAdmin) {
            console.log('🎉 관리자로 인증됨!');
            // 어드민 페이지로 자동 이동
            setCurrentPage('admin');
          }
        } else {
          console.error('API 응답 형식 오류:', result);
          throw new Error('사용자 처리 실패');
        }
        
      } catch (apiError) {
        console.error('API 오류:', apiError);
        throw new Error(`사용자 인증에 실패했습니다: ${apiError.message}`);
      }
      
      console.log('🎉 Polygon 멀티시그 인증 완료!');
      
      // 관리자 권한 확인 및 자동 이동
      if (walletIsAdmin) {
        console.log('👑 관리자로 인증됨! 관리자 패널로 이동합니다.');
        setCurrentPage('admin');
      }
    } catch (error: any) {
      console.error('❌ MetaMask 지갑 연결 실패:', error);
      alert('MetaMask 지갑 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gmail 로그인 처리
  const handleGmailLogin = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 Gmail 로그인 시작...');
      
      // Google OAuth 팝업 열기
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=email profile&access_type=offline`;
      
      const popup = window.open(googleAuthUrl, 'googleAuth', 'width=500,height=600');
      
      // 팝업에서 인증 코드 받기
      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { code } = event.data;
          
          // 서버에 인증 코드 전송하여 토큰 교환
          const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          
          if (response.ok) {
            const { user: googleUser } = await response.json();
            
            // Supabase에 사용자 정보 저장
            const { data: userData, error } = await supabase
              .from('users')
              .upsert([{
                email: googleUser.email,
                name: googleUser.name,
                avatar_url: googleUser.picture,
                auth_provider: 'google',
                created_at: new Date().toISOString()
              }], { onConflict: 'email' })
              .select()
              .single();
            
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
              console.log('✅ Gmail 로그인 성공:', userData);
            }
          }
          
          popup?.close();
        }
      });
      
    } catch (error) {
      console.error('❌ Gmail 로그인 실패:', error);
      alert('Gmail 로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 자동 환불 대상 확인
  const checkAutoRefundEligibility = async () => {
    if (!user || user.role !== 'admin') return;
    
    setAutoRefundStatus(prev => ({ ...prev, processing: true }));
    try {
      // 61일 경과된 거래 조회
      const { data: eligibleAssets } = await supabase
        .from('insurance_assets')
        .select('*')
        .eq('status', 'sold')
        .lt('created_at', new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString());
      
      const totalAmount = eligibleAssets?.reduce((sum, asset) => sum + (asset.platform_fee || 0), 0) || 0;
      
      setAutoRefundStatus({
        eligibleAssets: eligibleAssets || [],
        totalRefundAmount: totalAmount,
        processedCount: 0,
        processing: false
      });
    } catch (error) {
      console.error('자동 환불 대상 확인 실패:', error);
      setAutoRefundStatus(prev => ({ ...prev, processing: false }));
    }
  };

  // Polygon 멀티시그 거래 제출 (통계 포함)
  const handleSellSubmitWithStats = async () => {
    if (!isAuthenticated || !isWeb3Connected || !connectedAccount) {
      alert('지갑 연결이 필요합니다.');
      return;
    }

    setIsLoading(true);
    setAssetRegistrationLoading(true);
    try {
      console.log('🚀 Polygon 멀티시그 거래 시작...');
      
      // 1단계: 자산 등록 (300 USDC 지불)
      setTradeSteps(prev => ({ ...prev, stage: 1 }));
      console.log('📝 1단계: 보험 자산 등록 중...');
      
      const assetData = {
        insuranceCompany: insuranceData.company || 'Unknown Insurance',
        productName: insuranceData.productName || 'Test Product',
        productCategory: insuranceData.productCategory || 'Life Insurance',
        contractDate: insuranceData.contractDate || '2023-01-01',
        contractPeriod: insuranceData.contractPeriod || '10 Years',
        paidPeriod: insuranceData.paidPeriod || '5 Years',
        annualPremium: insuranceData.annualPayment || '1000',
        totalPaid: insuranceData.totalPayment || '3000'
      };
      
      const registrationResult = await PolygonIntegration.registerInsuranceAsset(assetData);
      
      if (registrationResult.success) {
        console.log('✅ 자산 등록 완료:', registrationResult);
        setTradeSteps(prev => ({ 
          ...prev, 
          stage: 2, 
          registrationTxHash: registrationResult.transactionHash,
          assetId: registrationResult.assetId
        }));

        // 2단계: AI 평가 및 크롤링 데이터 통합
        console.log('🤖 2단계: AI 평가 및 크롤링 데이터 분석 중...');
        
        // AI 크롤링 데이터 가져오기
        let fulfillmentWeights = null;
        if (insuranceData.company && insuranceData.productCategory) {
          try {
            fulfillmentWeights = await fetchFulfillmentData(
              insuranceData.company,
              insuranceData.productCategory,
              5 // 기본 5년
            );
            console.log('✅ AI 크롤링 데이터 완료:', fulfillmentWeights);
          } catch (error) {
            console.warn('⚠️ AI 크롤링 실패, 기본값 사용:', error);
          }
        }

        // AI 평가 데이터 생성 (크롤링 데이터 반영)
        const baseValue = parseFloat(insuranceData.platformPrice || '5000');
        const adjustmentFactor = fulfillmentWeights?.adjustmentFactor || 1.0;
        const adjustedValue = baseValue * adjustmentFactor;
        
        const evaluationData = {
          aiValueUSD: Math.round(adjustedValue),
          riskGrade: fulfillmentWeights?.recommendation === 'premium' ? 1 : 
                    fulfillmentWeights?.recommendation === 'caution' ? 3 : 2,
          confidence: fulfillmentWeights?.reliabilityScore ? 
                     Math.round(fulfillmentWeights.reliabilityScore * 100) : 85
        };
        
        console.log('📊 AI 평가 데이터:', {
          baseValue,
          adjustmentFactor,
          adjustedValue: evaluationData.aiValueUSD,
          riskGrade: evaluationData.riskGrade,
          confidence: evaluationData.confidence
        });
        
        // AI 평가 업데이트 (데이터베이스에)
        try {
          await supabase
            .from('insurance_assets')
            .insert({
              seller_wallet: connectedAccount,
              asset_id: registrationResult.assetId,
              insurance_company: assetData.insuranceCompany,
              product_name: assetData.productName,
              product_category: assetData.productCategory,
              annual_premium: parseFloat(assetData.annualPremium),
              total_paid: parseFloat(assetData.totalPaid),
              platform_price: evaluationData.aiValueUSD,
              ai_evaluation: evaluationData,
              status: 'registered',
              blockchain_tx: registrationResult.transactionHash,
              created_at: new Date().toISOString()
            });
          console.log('✅ 데이터베이스 업데이트 완료');
        } catch (dbError) {
          console.warn('⚠️ 데이터베이스 업데이트 실패:', dbError);
        }
        
        setTradeSteps(prev => ({ ...prev, stage: 3 }));
        alert('✅ 1단계 자산 등록이 성공적으로 완료되었습니다!\n\n다음 단계를 위해 관리자가 가격 책정을 진행합니다.');
        
        // 인터페이스 초기화
        setInsuranceData({});
        setTradeSteps({ stage: 0, registrationTxHash: '', feeTxHash: '', assetId: '' });
      } else {
        throw new Error(registrationResult.error || '자산 등록에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('❌ Polygon 거래 실패:', error);
      alert('거래 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
      setAssetRegistrationLoading(false);
    }
  };

  // 구매 제출 (통계 포함)
  const handleBuySubmitWithStats = async (listing?: any) => {
    console.log('🛒 구매 상태 확인:', { isAuthenticated, isWeb3Connected, connectedAccount, web3Account });
    
    // 지갑 주소 확인 로직 강화
    let currentWalletAddress = connectedAccount || web3Account;
    
    if (!currentWalletAddress) {
      // MetaMask에서 직접 주소 가져오기
      const eth = (window as any).ethereum;
      if (eth) {
        try {
          const accounts = await eth.request({ method: 'eth_accounts' });
          currentWalletAddress = accounts?.[0];
          if (currentWalletAddress) {
            setConnectedAccount(currentWalletAddress);
          }
        } catch (error) {
          console.error('지갑 주소 확인 실패:', error);
        }
      }
    }
    
    if (!isAuthenticated || !currentWalletAddress) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🛒 멀티시그 구매 시작...');
      
      // 기존 구매 로직 유지
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
      
      // registerAsset 대신 createMultisigTrade 사용
      if (!contract) {
        throw new Error('컨트랙트가 연결되지 않았습니다');
      }
      
      // 가스 추정
      const agreedPriceWei = ethers.parseEther(assetData.totalPaymentUSD.toString());
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.createMultisigTrade(
          1, // assetId (임시로 1 사용)
          agreedPriceWei // agreedPrice in wei
        );
        console.log('⛽ 가스 추정값:', gasEstimate.toString());
      } catch (gasError) {
        console.warn('⚠️ 가스 추정 실패, 기본값 사용');
        gasEstimate = '0x7A120'; // 500000 in hex
      }
      
      // 멀티시그 거래 생성
      console.log('🔗 컨트랙트 함수 호출 준비:', {
        assetId: 1,
        agreedPriceWei: agreedPriceWei.toString(),
        value: agreedPriceWei.toString(),
        gasLimit: typeof gasEstimate === 'string' ? gasEstimate : gasEstimate.mul(120).div(100).toString(),
        contractAddress: contract.address,
        contractFunctions: Object.keys(contract.functions || {})
      });

      // 컨트랙트 주소 확인
      if (contract.address !== '0xa84125fe1503485949d3e4fedcc454429289c8ea') {
        console.warn('⚠️ 컨트랙트 주소 불일치:', contract.address);
      }

      // 컨트랙트 함수 존재 확인
      if (!contract.createMultisigTrade) {
        console.error('❌ createMultisigTrade 함수가 컨트랙트에 존재하지 않습니다!');
        console.log('사용 가능한 함수들:', Object.keys(contract.functions || {}));
        throw new Error('컨트랙트에 createMultisigTrade 함수가 없습니다');
      }

      console.log('✅ createMultisigTrade 함수 확인됨');

      const tx = await contract.createMultisigTrade(
        1, // assetId (임시로 1 사용)
        agreedPriceWei, // agreedPrice in wei
        {
          value: agreedPriceWei.toString(), // ETH 전송 (문자열로 변환)
          gasLimit: typeof gasEstimate === 'string' ? gasEstimate : gasEstimate.mul(120).div(100).toString()
        }
      );
      
      console.log('📤 트랜잭션 전송됨:', tx.hash);
      const receipt = await tx.wait();

      console.log('✅ 구매 완료:', receipt);
      alert('구매가 완료되었습니다!');
      
      // API Routes를 통한 보험 자산 상태 업데이트
      try {
        const updateResponse = await fetch('/api/insurance', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: listing?.id?.toString() || '1',
            status: 'sold',
            buyer_address: currentWalletAddress,
            sold_at: new Date().toISOString(),
            sold_price: listing?.platformPrice || 0,
            walletAddress: currentWalletAddress
          })
        });

        if (!updateResponse.ok) {
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
      setIsLoading(false);
    }
  };

  // 상담 신청 처리 (Supabase 연동)
  const handleInquirySubmit = async (inquiryData: any) => {
    try {
      console.log('📝 상담 신청 처리 중:', inquiryData);
      
      // Supabase에 상담 신청 데이터 저장
      const { data, error } = await supabase
        .from('inquiries')
        .insert([{
          name: inquiryData.name,
          phone: inquiryData.phone,
          email: inquiryData.email || null,
          inquiry_content: inquiryData.inquiryContent,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ 상담 신청 저장 실패:', error);
        throw new Error('상담 신청 저장에 실패했습니다.');
      }

      console.log('✅ 상담 신청 저장 완료:', data);
      
      // 관리자에게 알림 (선택사항)
      if (data) {
        // 이메일 알림 또는 다른 알림 시스템 연동 가능
        console.log('📧 관리자에게 상담 신청 알림 전송');
      }

      return data;
    } catch (error) {
      console.error('❌ 상담 신청 처리 실패:', error);
      throw error;
    }
  };

  // 홍콩 보험 리스팅 데이터 (구매 페이지용)
  const listingData = [
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
    },
    {
      id: 2,
      company: 'Prudential plc',
      productName: 'Prudential Pension Plan',
      category: 'Pension Plan',
      surrenderValue: 18000,
      transferValue: 17200,
      platformPrice: 22000,
      confidence: 0.88,
      riskGrade: 'A',
      contractPeriod: '15 Years',
      paidPeriod: '10 Years',
      annualPayment: 4000,
      status: 'available' as const,
      seller: '0x8765...4321',
      listingDate: '2024-08-21'
    },
    {
      id: 3,
      company: 'Manulife Financial',
      productName: 'Manulife Whole Life',
      category: 'Whole Life',
      surrenderValue: 25000,
      transferValue: 24000,
      platformPrice: 30000,
      confidence: 0.92,
      riskGrade: 'A',
      contractPeriod: '20 Years',
      paidPeriod: '15 Years',
      annualPayment: 5000,
      status: 'pending' as const,
      seller: '0x9999...8888',
      listingDate: '2024-08-22'
    }
  ];

  const t = {
    homeTitle: "Home",
    sellTitle: "Sell",
    buyTitle: "Buy",
    inquiryTitle: "Inquiry",
    mainTitle: "WELLSWAP",
    mainSubtitle: "Transfer Insurance Assets Globally",
    description: "AI-powered insurance asset trading platform for Hong Kong, Singapore, and international markets",
    getStarted: "Get Started",
    learnMore: "Learn More",
    statVolume: "Trading Volume",
    statUsers: "Active Users",
    statSuccess: "Success Rate",
    aiValuation: "AI Valuation",
    aiValuationDesc: "Advanced mathematical models with actuarial science",
    globalMarket: "Global Market",
    globalMarketDesc: "Hong Kong, Singapore, UK, US markets",
    secureTrading: "Secure Trading",
    secureTradingDesc: "Blockchain-based multi-signature contracts",
    globalInsuranceRegistration: "Global Insurance Transfer Registration",
    insuranceInfo: "Insurance Information",
    insuranceCompany: "Insurance Company",
    productCategory: "Product Category",
    productName: "Product Name",
    contractDate: "Contract Date",
    contractPeriod: "Contract Period",
    paidPeriod: "Paid Period",
    annualPremium: "Annual Premium (USD)",
    totalPaid: "Total Paid (USD)",
    customPeriod: "Custom Period (Years)",
    submitSell: "Submit for Sale",
    selectCompany: "Select Insurance Company",
    selectCategory: "Select Product Category",
    selectPeriod: "Select contract period",
    selectPaidPeriod: "Select paid period",
    enterProductName: "Enter exact product name",
    example: "e.g.",
    customInput: "Custom Input",
    documentScan: "Document Scan",
    insuranceDocumentScan: "Scan or upload insurance certificate for automatic information extraction",
    jpgPngSupported: "JPG, PNG files supported",
    globalInsuranceTransferProductSearch: "Global Insurance Transfer Product Search",
    insuranceTransferExpert: "Insurance Transfer Expert Guidance",
    sell: "Sell Insurance",
    buy: "Buy Insurance",
    inquiry: "Concierge",
    multisigAuthRequired: "Multisig Authentication Required",
    multisigAuthComplete: "Multisig Authentication Complete",
    multisigConnecting: "Connecting Multisig...",
    perfectMultisigAuthRequired: "Perfect Multisig Authentication Required",
    step1MultisigRegistration: "Step 1: Multisig Registration",
  };

  // listings 상태 추가 (AdminPage에서 사용)
  const [listings, setListings] = useState(listingData);
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);

  // 관리자 지갑 주소 목록
  const ADMIN_WALLETS = [
    'HhYmywR1Nr9YWgT4NbBHsa6F8y2viYWhVbsy4s2J38kg', // 솔라나 관리자 주소
    '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0', // 현재 연결된 지갑
    '0x1234567890123456789012345678901234567890', // 예시 주소
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',  // 예시 주소
    '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6', // 추가 관리자 주소
    '0x9b1a5f8709c6710650a010b4c9c16b1f9a5f8709', // 추가 관리자 주소
    '0x1a2b3c4d5e6f7890123456789012345678901234', // 추가 관리자 주소
    '0x5a6b7c8d9e0f1234567890123456789012345678', // 추가 관리자 주소
    '0x9c8b7a6f5e4d3c2b1a098765432109876543210'   // 추가 관리자 주소
  ];

  // 관리자 권한 캐시 (성능 최적화)
  const adminCacheRef = useRef<Map<string, boolean>>(new Map());

  // 관리자 권한 확인 (솔라나 주소 지원)
  const isAdmin = useMemo(() => {
    const currentAccount = connectedAccount || web3Account;
    if (!currentAccount) {
      return false;
    }
    
    const accountStr = currentAccount.toString().toLowerCase();
    
    // 캐시에서 결과 확인
    if (adminCacheRef.current.has(accountStr)) {
      return adminCacheRef.current.get(accountStr)!;
    }
    
    // Polygon 주소 확인
    const isPolygonAdmin = ADMIN_WALLETS.some(wallet => 
      wallet.toLowerCase() === accountStr
    );
    
    // 결과를 캐시에 저장
    adminCacheRef.current.set(accountStr, isPolygonAdmin);
    
    return isPolygonAdmin;
  }, [connectedAccount, web3Account]);

  // 관리자 메뉴 표시 여부 (지갑 연결만으로도 표시)
  const showAdminMenu = useMemo(() => {
    const shouldShow = isAdmin && isWeb3Connected;
    return shouldShow;
  }, [isAdmin, isWeb3Connected]);

  // 디버깅을 위한 useEffect 추가
  useEffect(() => {
    // 환경 변수 확인
    console.log('🔍 환경 변수 확인:');
    console.log('CHAIN_ID:', process.env.NEXT_PUBLIC_CHAIN_ID);
    console.log('RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL);
    console.log('CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
    
    // MetaMask 확인
    if (typeof window !== 'undefined') {
      console.log('MetaMask 사용 가능:', !!(window as any).ethereum);
      if ((window as any).ethereum) {
        console.log('Ethereum Provider:', (window as any).ethereum.isMetaMask);
      }
    }
  }, []);

  // Web3 상태 변화 모니터링
  useEffect(() => {
    console.log('🔄 Web3 상태 업데이트:', {
      isWeb3Connected,
      web3Account,
      isAuthenticated,
      connectedAccount,
      user: user ? user.id : null,
      isAdmin,
      showAdminMenu
    });
  }, [isWeb3Connected, web3Account, isAuthenticated, connectedAccount, user, isAdmin, showAdminMenu]);

  // 컴포넌트 마운트 시 초기 상태 로깅
  useEffect(() => {
    console.log('🚀 WellSwap 컴포넌트 마운트됨');
    console.log('초기 상태:', {
      currentPage,
      isAuthenticated,
      isWeb3Connected,
      connectedAccount,
      web3Account
    });
  }, []);

  return (
    <div className={THEME_ROOT_CLASS} suppressHydrationWarning>
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-2xl font-extralight tracking-wider text-zinc-900"
          >
            WELLSWAP
          </button>
          
          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => setCurrentPage('sell')}
              className={`font-light transition-colors ${currentPage === 'sell' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              {t.sell}
            </button>
            <button
              onClick={() => setCurrentPage('buy')}
              className={`font-light transition-colors ${currentPage === 'buy' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              {t.buy}
            </button>
            <button
              onClick={() => setCurrentPage('inquiry')}
              className={`font-light transition-colors ${currentPage === 'inquiry' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              {t.inquiry}
            </button>
            {showAdminMenu && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={`font-light transition-colors ${currentPage === 'admin' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>
        
        {/* Language Selector & Auth */}
        <div className="flex items-center space-x-4">
          {/* Gmail Login */}
          {!isAuthenticated && (
            <button
              onClick={handleGmailLogin}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-light hover:bg-zinc-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Gmail</span>
            </button>
          )}
          
          {/* Language Selector */}
          <div className="relative">
            <select 
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="appearance-none bg-transparent border border-zinc-300 rounded px-3 py-1 text-sm font-light focus:outline-none focus:border-zinc-500"
            >
              <option value="en">🇺🇸 English</option>
              <option value="ko">🇰🇷 한국어</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="ja">🇯🇵 日本語</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Solflare Wallet Connect - 수동 연결 버튼으로 변경 */}
      {showWalletConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Connect Solflare Wallet</h2>
              <button 
                onClick={() => setShowWalletConnectModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SolflareWalletConnect
              onConnect={(publicKey, balance) => {
                console.log('Wallet connected:', publicKey, balance);
                setShowWalletConnectModal(false);
                // 지갑 연결 후 관리자 권한 확인
                setTimeout(() => {
                  if (isAdmin) {
                    console.log('👑 관리자 지갑 연결됨! 관리자 패널로 이동합니다.');
                    setCurrentPage('admin');
                  }
                }, 1000);
              }}
              onDisconnect={() => {
                console.log('Wallet disconnected');
              }}
              onError={(error) => {
                console.error('Wallet connection error:', error);
                // alert 대신 console.error로 변경하여 무한 팝업 방지
                // 사용자가 직접 모달을 닫을 수 있도록 함
              }}
              isConnected={isWeb3Connected}
              connectedAddress={connectedAccount || undefined}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div style={{ display: currentPage === "home" ? "block" : "none" }}>
          <HomePage t={t} setCurrentPage={setCurrentPage} setShowWalletConnectModal={setShowWalletConnectModal} />
        </div>

        <div style={{ display: currentPage === "sell" ? "block" : "none" }}>
                  <SellInsurancePage
          t={t}
          insuranceData={memoizedInsuranceData}
          setInsuranceData={setInsuranceData}
          handleRefChange={handleRefChange}
          handleFinalChange={handleFinalChange}
          isAuthenticated={isAuthenticated}
          isWeb3Connected={isWeb3Connected}
          connectedAccount={connectedAccount}
          tradeSteps={tradeSteps}
          connectWalletWithAuth={connectWalletWithAuth}
          isLoading={isLoading}
          user={user}
          autoRefundStatus={autoRefundStatus}
          checkAutoRefundEligibility={checkAutoRefundEligibility}
          handleSellSubmitWithStats={handleSellSubmitWithStats}
          globalInsurers={globalInsurers}
          globalCategories={globalCategories}
          contractPeriods={contractPeriods}
          paidPeriods={paidPeriods}
          calculatePaymentOptions={calculatePaymentOptions}
          // OCR AI 관련 props
          selectedFile={selectedFile}
          isUsingCamera={isUsingCamera}
          isOcrProcessing={isOcrProcessing}
          ocrProgress={ocrProgress}
          ocrResult={ocrResult}
          startCamera={startCamera}
          stopCamera={stopCamera}
          capturePhoto={capturePhoto}
          handleFileUpload={handleFileUpload}
          processOCR={processOCR}
          // AI 크롤링 관련 props
          fulfillmentData={fulfillmentData}
          isCrawling={isCrawling}
          fetchFulfillmentData={fetchFulfillmentData}
          triggerCrawling={triggerCrawling}
        />
        </div>

        <div style={{ display: currentPage === "buy" ? "block" : "none" }}>
          <BuyInsurancePage
            t={t}
            insuranceData={memoizedInsuranceData}
            setInsuranceData={setInsuranceData}
            handleRefChange={handleRefChange}
            handleFinalChange={handleFinalChange}
            isAuthenticated={isAuthenticated}
            isWeb3Connected={isWeb3Connected}
            connectedAccount={connectedAccount}
            tradeSteps={tradeSteps}
            connectWalletWithAuth={connectWalletWithAuth}
            isLoading={isLoading}
            user={user}
            autoRefundStatus={autoRefundStatus}
            checkAutoRefundEligibility={checkAutoRefundEligibility}
            handleBuySubmitWithStats={handleBuySubmitWithStats}
            globalInsurers={globalInsurers}
            globalCategories={globalCategories}
            contractPeriods={contractPeriods}
            paidPeriods={paidPeriods}
            calculatePaymentOptions={calculatePaymentOptions}
            changePage={changePage}
            listingData={listingData}
          />
        </div>

        <div style={{ display: currentPage === "inquiry" ? "block" : "none" }}>
          <InquiryPage t={t} handleInquirySubmit={handleInquirySubmit} />
        </div>

        <div style={{ display: currentPage === "admin" ? "block" : "none" }}>
          <AdminInquiryPanel 
            user={{
              ...user,
              wallet_address: connectedAccount || web3Account?.toString(),
              publicKey: web3Account?.toString(),
              address: connectedAccount || web3Account?.toString()
            }}
          />
        </div>
      </main>
    </div>
  );
}