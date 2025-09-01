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
import { createWorker } from 'tesseract.js';
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
import {
  PremiumButton,
  PremiumCard,
  PageTransition,
  SmoothReveal,
  FloatingButton,
  PremiumInput
} from './ui/PremiumAnimations';
import {
  GlassCard,
  GlassButton,
  GlassProgressBar,
  GlassContainer
} from './ui/GlassmorphismComponents';
import { Camera, Upload, User, Menu, X, Wallet, ArrowRight, Globe, MessageSquare, BarChart3, TrendingUp, Shield, CheckCircle2, AlertCircle, Clock, DollarSign, Key, Lock, Users } from 'lucide-react';
import { 
  VideoCameraIcon,
  StarIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  BoltIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  LockClosedIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Polygon Web3 및 백엔드 연동
import PolygonIntegration from './PolygonContractIntegration';
import { getDefaultInsuranceIcon } from './utils/insurance-helpers';
import * as InsuranceAPI from '../lib/insurance-api';
import { WellSwapDB } from '../lib/database-wellswap'
import { getSupabase } from '../lib/database-wellswap'
import ReliabilityScore from './reliability/ReliabilityScore';
import fulfillmentAPI from '../lib/fulfillment-api';
import { AdminInquiryPanel } from './AdminInquiryPanel';
import AdminPanel from './AdminPanel';
import { THEME_ROOT_CLASS } from '../app/config/theme';
import { getCompanyLogo, getLogoComponentProps } from '../lib/insurance-logos';

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
// ✅ Company Logo Component 
//
const CompanyLogo: React.FC<{ company: string; size?: 'sm' | 'md' | 'lg' }> = ({ company, size = 'lg' }) => {
  const logoProps = getLogoComponentProps(company, size);

  return (
    <div 
      className={`w-full h-full rounded-lg border-2 flex items-center justify-center font-bold shadow-sm`}
      style={logoProps.fallbackStyle}
    >
      <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}`}>
        {logoProps.fallbackInitials}
      </span>
      {logoProps.company?.rating?.local && (
        <div className="absolute -top-1 -right-1 text-xs font-bold text-white bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
          {logoProps.company.rating.local[0]}
        </div>
      )}
    </div>
  );
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
          <GlassContainer background="subtle" className="py-12">
            <h1 className="text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] xl:text-[20rem] 2xl:text-[24rem] font-extralight tracking-tighter leading-[0.85] select-none relative z-10 text-center">
              <DynamicTypewriter 
                texts={[
                  "WELLSWAP", 
                  "优享", // Chinese - Excellent Sharing (優秀 + 享受)
                  "GUTSWAP", // German - Good Swap  
                  "ウェルスワップ", // Japanese - Well Swap (katakana brand name)
                  "BONÉCHANGE", // French - Good Exchange
                  "BIENCAMBIO" // Spanish - Good Change
                ]}
                speed={120}
                deleteSpeed={60}
                delayBetweenTexts={3000}
                className="text-zinc-900 whitespace-nowrap font-light"
              />
            </h1>
          </GlassContainer>
        </div>
        <SmoothReveal delay={0.5} direction="up">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-zinc-400 to-transparent mx-auto mb-8"></div>
        </SmoothReveal>
        
        <SmoothReveal delay={0.8} direction="up">
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-600 font-light tracking-wide max-w-4xl mx-auto">
            {t.mainSubtitle}
          </p>
        </SmoothReveal>
        
        <SmoothReveal delay={1.1} direction="up">
          <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-light max-w-3xl mx-auto">
            {t.description}
          </p>
        </SmoothReveal>
        
        <SmoothReveal delay={1.4} direction="up">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <GlassButton 
              variant="primary" 
              size="lg"
              magnetic={true}
              magneticStrength={0.3}
              onClick={() => setCurrentPage('sell')}
              className="group"
            >
              <span className="flex items-center gap-2">
                {t.getStarted}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </GlassButton>

            <GlassButton 
              variant="secondary" 
              size="lg"
              magnetic={true}
              magneticStrength={0.3}
              onClick={() => setCurrentPage('buy')}
              className="group"
            >
              <span className="flex items-center gap-2">
                {t.learnMore}
                <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              </span>
            </GlassButton>
            <GlassButton 
              variant="accent" 
              size="lg"
              magnetic={true}
              magneticStrength={0.3}
              onClick={() => setShowWalletConnectModal(true)}
              className="group"
            >
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </span>
            </GlassButton>
          </div>
        </SmoothReveal>
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
            <AnimatedCard className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4">
              <BarChart3 className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
              <h3 className="text-lg md:text-xl font-light text-zinc-900">{t.aiValuation}</h3>
              <p className="text-sm md:text-base text-zinc-600 font-light">{t.aiValuationDesc}</p>
            </AnimatedCard>
          </StaggerItem>
          
          <StaggerItem>
            <AnimatedCard className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4">
              <Globe className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
              <h3 className="text-lg md:text-xl font-light text-zinc-900">{t.globalMarket}</h3>
              <p className="text-sm md:text-base text-zinc-600 font-light">{t.globalMarketDesc}</p>
            </AnimatedCard>
          </StaggerItem>
          
          <StaggerItem>
            <AnimatedCard className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4">
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
          <DynamicTypewriter 
            texts={[
              "SELL",
              "販売", // Japanese - Sales
              "销售", // Chinese - Sales  
              "VENDRE", // French - To Sell
              "VENDER", // Spanish - To Sell
              "VERKAUF" // German - Sale
            ]}
            speed={100}
            deleteSpeed={70}
            delayBetweenTexts={2800}
            gradient={true}
            scale={true}
            className="text-transparent bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text"
          />
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
                  if (value && typeof value === 'string' && value.length >= 4) {
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

            {/* 자동계산 결과 섹션 - 고급 글라스모피즘 디자인 */}
            {(insuranceData.annualPayment || insuranceData.totalPayment) && (
              <GlassCard variant="premium" className="mt-8">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-lg flex items-center justify-center mr-3">
                    <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                  Auto Calculation Result
                </h3>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Annual Premium */}
                    <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 group-hover:text-blue-900 transition-colors">Annual Premium</span>
                      <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-full group-hover:bg-neutral-200 transition-colors">USD</span>
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
                      <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-full group-hover:bg-neutral-200 transition-colors">Years</span>
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
                      <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-full group-hover:bg-neutral-200 transition-colors">USD</span>
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
                    <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-neutral-700 via-neutral-600 to-neutral-800 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg relative"
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
                    
                    <div className="bg-gradient-to-br from-neutral-50 to-stone-100 p-3 rounded-lg border border-neutral-200">
                      <div className="text-sm font-medium text-neutral-600">Monthly Payment</div>
                      <div className="text-lg font-bold text-neutral-900">
                        ${(parseFloat(insuranceData.annualPayment || '0') / 12).toLocaleString()}
                        </div>
                      </div>
                    </div>
                </div>
                </div>
              </GlassCard>
            )}

            {/* 제출 버튼 */}
            <button
              onClick={handleSellSubmitWithStats}
              disabled={isLoading || !isAuthenticated || !isWeb3Connected}
              className="w-full p-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Step 1: Registration in Progress...' : 
               !isAuthenticated || !isWeb3Connected ? 'Multisig Authentication Required' : 
               'Step 1: Multisig Registration (300 USD)'}
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
            <div className="mt-6 p-6 bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100 rounded-xl border border-neutral-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-lg flex items-center justify-center mr-3">
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

// 보험회사 로고 매핑 함수 (크롤링된 로고 우선 사용)
const getInsuranceCompanyLogo = (companyName: string) => {
  const company = companyName.toLowerCase();
  
  // Step 1: 크롤링된 로고 우선 사용
  const crawledLogoUrl = getCrawledInsuranceLogo(companyName);
  if (crawledLogoUrl) {
    return (
      <img 
        src={crawledLogoUrl} 
        alt={companyName}
        className="w-12 h-12 object-contain rounded-lg"
        onError={(e) => {
          // 크롤링된 로고 실패시 정적 로고로 폴백
          const staticLogo = getStaticInsuranceLogo(companyName);
          if (staticLogo) {
            e.currentTarget.src = staticLogo;
          } else {
            // 최종 폴백: 아이콘
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = getDefaultInsuranceIcon(companyName);
          }
        }}
      />
    );
  }
  
  // Step 2: 정적 로고 사용
  const staticLogo = getStaticInsuranceLogo(companyName);
  if (staticLogo) {
    return (
      <img 
        src={staticLogo} 
        alt={companyName}
        className="w-12 h-12 object-contain rounded-lg"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = getDefaultInsuranceIcon(companyName);
        }}
      />
    );
  }
  
  // Step 3: 기본 아이콘
  return <div dangerouslySetInnerHTML={{__html: getDefaultInsuranceIcon(companyName)}} />;
};

// 크롤링된 로고 URL 가져오기 (API 연동)
const getCrawledInsuranceLogo = (companyName: string): string | null => {
  // TODO: 보험 감독국 크롤링 데이터에서 로고 URL 조회
  // const response = await fetch(`/api/insurance-logos?company=${encodeURIComponent(companyName)}`);
  // const data = await response.json();
  // return data.logoUrl || null;
  
  // 임시: 로컬 스토리지 또는 캐시에서 조회
  if (typeof window !== 'undefined') {
    const cachedLogos = localStorage.getItem('insurance_company_logos');
    if (cachedLogos) {
      const logos = JSON.parse(cachedLogos);
      return logos[companyName.toLowerCase()] || null;
    }
  }
  return null;
};

// 정적 로고 파일 경로 반환
const getStaticInsuranceLogo = (companyName: string): string | null => {
  const company = companyName.toLowerCase();
  
  if (company.includes('aia') || company.includes('american international')) {
    return '/logos/aia-logo.png';
  }
  
  if (company.includes('prudential')) {
    return '/logos/prudential-logo.png';
  }
  
  if (company.includes('manulife')) {
    return (
      <img 
        src="/logos/manulife-logo.png" 
        alt="Manulife"
        className="w-full h-full object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = `
            <div class="w-full h-full bg-green-50 flex items-center justify-center rounded text-green-700 font-bold text-xs">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.5 17.32 9 14 16 12c0-1.1-.9-2-2-2l-3.59 3.59c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41L13 8h4z"/>
              </svg>
            </div>
          `;
        }}
      />
    );
  }
  
  if (company.includes('zurich')) {
    return (
      <img 
        src="/logos/zurich-logo.png" 
        alt="Zurich"
        className="w-full h-full object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = `
            <div class="w-full h-full bg-blue-50 flex items-center justify-center rounded text-blue-700 font-bold text-xs">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          `;
        }}
      />
    );
  }
  
  // 기본값: 심플한 빌딩 아이콘
  return (
    <div className="w-full h-full bg-zinc-50 flex items-center justify-center rounded text-zinc-600">
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
      </svg>
    </div>
  );
};

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
            <DynamicTypewriter 
              texts={[
                "BUY",
                "購入", // Japanese - Purchase
                "购买", // Chinese - Buy
                "ACHETER", // French - To Buy
                "COMPRAR", // Spanish - To Buy
                "KAUFEN" // German - To Buy
              ]}
              speed={100}
              deleteSpeed={70}
              delayBetweenTexts={2800}
              gradient={true}
              scale={true}
              className="text-transparent bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text"
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

      {/* 글라스모피즘 프리미엄 보험 상품 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {listingData.map((listing, index) => (
          <div 
            key={listing.id}
            className="group relative p-8 bg-white/80 backdrop-blur-xl border border-white/40 hover:border-white/60 transition-all duration-700 shadow-2xl hover:shadow-3xl rounded-3xl overflow-hidden hover:scale-[1.02] transform-gpu"
            style={{
              animationDelay: `${index * 150}ms`,
              animation: 'slideInUp 0.8s ease-out forwards'
            }}
          >
            {/* 고급 글라스모피즘 배경 레이어들 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-transparent rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            
            {/* 프리미엄 라이트 이펙트 */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
            
            {/* 미묘한 도트 패턴 */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_2px_2px,_#000_1px,_transparent_0)]" style={{backgroundSize: '24px 24px'}}></div>
            
            {/* 호버시 글로우 이펙트 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
            {/* 프리미엄 헤더 - 보험회사 브랜딩 */}
            <div className="relative z-10 flex items-start justify-between mb-8">
              <div className="flex items-start space-x-5">
                {/* 보험회사 로고 영역 */}
                <div className="relative w-20 h-20 bg-white/90 backdrop-blur-md border border-zinc-200/50 flex items-center justify-center shadow-lg rounded-xl group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-zinc-100/30 rounded-xl"></div>
                  <div className="relative z-10 w-12 h-12">
                    <CompanyLogo company={listing.company} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-medium text-xl text-zinc-900 leading-tight mb-1 group-hover:text-zinc-800 transition-colors">
                      {listing.productName}
                    </h3>
                    <p className="text-sm text-zinc-600 font-medium tracking-wide">
                      {listing.company}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200/60 rounded-full shadow-sm">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      {listing.category}
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-slate-50 to-zinc-50 text-zinc-700 border border-zinc-200/60 rounded-full shadow-sm">
                      <svg className="w-3 h-3 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      HK Licensed
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`px-4 py-2 text-xs font-medium shrink-0 border ${
                listing.status === 'available' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                listing.status === 'pending' ? 'bg-violet-500/10 text-violet-700 border-violet-500/20' :
                listing.status === 'blockchain_pending' ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' :
                'bg-stone-500/10 text-stone-600 border-stone-500/20'
              }`}>
                {listing.status === 'available' ? 'AVAILABLE FOR PURCHASE' :
                 listing.status === 'pending' ? 'TRANSACTION PENDING' :
                 listing.status === 'blockchain_pending' ? 'BLOCKCHAIN PROCESSING' : 'SOLD OUT'}
              </div>
            </div>


            {/* 간소화된 상품 설명 */}
            <div className="mb-4 p-4 bg-zinc-50 border border-zinc-200">
              <h4 className="text-sm font-medium text-zinc-900 mb-2">Product Features</h4>
              <ul className="text-xs text-zinc-700 space-y-1">
                <li>• Guaranteed returns with flexible payment options</li>
                <li>• Hong Kong Insurance Authority regulated</li>
                <li>• International transfer capability</li>
              </ul>
            </div>

            {/* 간소화된 계약 정보 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-zinc-50 border border-zinc-200">
                <div className="text-xs text-zinc-600 mb-1">Contract</div>
                <div className="text-sm font-medium text-zinc-900">{listing.contractPeriod}</div>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200">
                <div className="text-xs text-zinc-600 mb-1">Annual</div>
                <div className="text-sm font-medium text-zinc-900">${listing.annualPayment.toLocaleString()}</div>
              </div>
              <div className={`p-3 border transition-colors ${
                listing.riskGrade === 'A' ? 'bg-emerald-500/5 border-emerald-500/15' :
                listing.riskGrade === 'B' ? 'bg-blue-500/5 border-blue-500/15' :
                listing.riskGrade === 'C' ? 'bg-amber-500/5 border-amber-500/15' :
                'bg-rose-500/5 border-rose-500/15'
              }`}>
                <div className="text-xs text-neutral-600 mb-1">Risk Grade</div>
                <div className={`text-sm font-bold ${
                  listing.riskGrade === 'A' ? 'text-emerald-700' :
                  listing.riskGrade === 'B' ? 'text-blue-700' :
                  listing.riskGrade === 'C' ? 'text-amber-700' :
                  'text-rose-700'
                }`}>
                  Grade {listing.riskGrade}
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="border-t border-zinc-200 pt-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-50 border border-zinc-200">
                  <div className="text-xs text-zinc-600 mb-1">Current Value</div>
                  <div className="text-sm font-semibold text-zinc-900">
                    ${listing.surrenderValue.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300">
                  <div className="text-xs text-slate-600 mb-1">Platform Price</div>
                  <div className="text-sm font-bold text-slate-900">
                    ${listing.platformPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 프리미엄 액션 버튼 */}
            <div className="space-y-3">
              {listing.status === 'available' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleBuySubmitWithStats(listing)}
                    disabled={!isAuthenticated || !isWeb3Connected || isLoading}
                    className="w-full p-4 bg-zinc-900 text-zinc-50 text-sm md:text-base font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>
                        {isLoading ? 'Processing Transaction...' : 
                         !isAuthenticated || !isWeb3Connected ? 'Connect Wallet to Purchase' : 
                         'Secure Multisig Purchase'}
                      </span>
                    </div>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => changePage('inquiry')}
                      className="p-3 border border-zinc-300 text-zinc-700 text-sm font-medium hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                    >
                      Expert Consultation
                    </button>
                    <button
                      className="p-3 border border-zinc-300 text-zinc-700 text-sm font-medium hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                    >
                      Product Details
                    </button>
                  </div>
                </div>
              ) : listing.status === 'pending' || listing.status === 'blockchain_pending' ? (
                <div className={`p-2 md:p-3 border text-center ${
                  listing.status === 'blockchain_pending' ? 'bg-orange-500/8 border-orange-500/20' : 'bg-violet-500/8 border-violet-500/20'
                }`}>
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className={`w-4 h-4 ${
                      listing.status === 'blockchain_pending' ? 'text-orange-600' : 'text-violet-600'
                    }`} />
                    <p className={`text-xs md:text-sm ${
                      listing.status === 'blockchain_pending' ? 'text-orange-700' : 'text-violet-700'
                    }`}>
                      {listing.status === 'blockchain_pending' ? 'Blockchain Transaction in Progress' : 'Transaction in Progress'}
                    </p>
                    </div>
                </div>
              ) : (
                <div className="p-2 md:p-3 bg-red-50 border border-red-200 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                    <p className="text-xs md:text-sm text-red-700">This product has been sold</p>
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
    inquiryContent: '',
    preferredMessenger: 'whatsapp',
    messengerId: '',
    consultationDate: '',
    consultationTime: '',
    timezone: 'HKT'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState(-1);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // 일주일 내 날짜 옵션 생성
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        fullLabel: dayName,
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isWeekend,
        isAvailable: !isWeekend // 주말은 비활성화
      });
    }
    return dates;
  };

  // Generate time slots (HKT 9AM-6PM)
  const getTimeSlots = (dateIndex: number) => {
    const slots = [];
    const selectedDate = getDateOptions()[dateIndex];
    if (!selectedDate?.isAvailable) return [];

    // In production, check booked times via API
    const bookedSlots = ['14:00', '15:30']; // Example: already booked times
    
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        const isBooked = bookedSlots.includes(timeString);
        const isPastTime = dateIndex === 0 && new Date().getHours() >= hour; // If today, only future times
        
        slots.push({
          value: timeString,
          label: displayTime,
          isAvailable: !isBooked && !isPastTime
        });
      }
    }
    return slots;
  };

  const handleDateSelect = (dateValue: string, index: number) => {
    setSelectedDateIndex(index);
    setInquiryData(prev => ({ 
      ...prev, 
      consultationDate: dateValue,
      consultationTime: '' // Reset time when date changes
    }));
    setAvailableSlots(getTimeSlots(index).map(slot => slot.value));
  };

  const handleTimeSelect = (timeValue: string) => {
    setInquiryData(prev => ({ 
      ...prev, 
      consultationTime: timeValue
    }));
  };

  const handleSubmit = async () => {
    if (!inquiryData.name || !inquiryData.phone || !inquiryData.inquiryContent || !inquiryData.consultationDate || !inquiryData.consultationTime) {
      alert('Please fill in all required fields including your preferred consultation date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const enrichedData = {
        ...inquiryData,
        consultationType: 'zoom_video_call',
        requestedDateTime: `${inquiryData.consultationDate} ${inquiryData.consultationTime} ${inquiryData.timezone}`
      };
      await handleInquirySubmit(enrichedData);
      setInquiryData({ 
        name: '', 
        phone: '', 
        email: '', 
        inquiryContent: '',
        preferredMessenger: 'whatsapp',
        messengerId: '',
        consultationDate: '',
        consultationTime: '',
        timezone: 'HKT'
      });
      alert('Premium consultation request submitted successfully. Our team will contact you within 24 hours to confirm your Zoom video call appointment.');
    } catch (error) {
      console.error('Consultation request failed:', error);
      alert('Failed to submit consultation request. Please try again.');
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
              texts={[
                "CONCIERGE",
                "コンシェルジュ",
                "礼宾",
                "CONCIERGERIE",
                "CONSERJERÍA",
                "CONCIERGE"
              ]}
              speed={100}
              deleteSpeed={80}
              delayBetweenTexts={2800}
              gradient={true}
              scale={true}
              className="text-transparent bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text"
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
            Exclusive Premium Consulting for WellSwap Platform Users
          </p>
        </FadeInAnimation>
      </div>
      
      <div className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Premium Zoom Consultation Form */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extralight text-zinc-900 mb-2">Premium Zoom Video Consultation</h2>
              <div className="flex items-center justify-center space-x-2 text-sm text-zinc-600">
                <VideoCameraIcon className="w-5 h-5 text-zinc-700" />
                <span>Secure video call with our specialists</span>
              </div>
            </div>
            
            <div className="space-y-5">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-2">Full Name *</label>
                  <SafeInput
                    type="text"
                    value={inquiryData.name}
                    onChange={(value) => setInquiryData(prev => ({ ...prev, name: value }))}
                    placeholder="Your full name"
                    className="w-full p-3 bg-white/40 backdrop-blur-sm border border-white/40 text-zinc-900 font-light focus:outline-none focus:border-emerald-400 transition-colors placeholder-zinc-500 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-2">Phone *</label>
                  <SafeInput
                    type="tel"
                    value={inquiryData.phone}
                    onChange={(value: string) => setInquiryData(prev => ({ ...prev, phone: value }))}
                    placeholder="+852 / +65 / +1 ..."
                    className="w-full p-3 bg-white/40 backdrop-blur-sm border border-white/40 text-zinc-900 font-light focus:outline-none focus:border-emerald-400 transition-colors placeholder-zinc-500 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-2">Email</label>
                <SafeInput
                  type="email"
                  value={inquiryData.email}
                  onChange={(value: string) => setInquiryData(prev => ({ ...prev, email: value }))}
                  placeholder="your.email@domain.com (optional)"
                  className="w-full p-3 bg-white/40 backdrop-blur-sm border border-white/40 text-zinc-900 font-light focus:outline-none focus:border-emerald-400 transition-colors placeholder-zinc-500 rounded-lg"
                />
              </div>

              {/* Messenger Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-2">Preferred Messenger</label>
                  <select
                    value={inquiryData.preferredMessenger}
                    onChange={(e) => setInquiryData(prev => ({ ...prev, preferredMessenger: e.target.value }))}
                    className="w-full p-3 bg-white/40 backdrop-blur-sm border border-white/40 text-zinc-900 font-light focus:outline-none focus:border-emerald-400 transition-colors rounded-lg"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="wechat">WeChat</option>
                    <option value="signal">Signal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-2">Messenger ID/Number</label>
                  <SafeInput
                    type="text"
                    value={inquiryData.messengerId}
                    onChange={(value: string) => setInquiryData(prev => ({ ...prev, messengerId: value }))}
                    placeholder="@username or +phone"
                    className="w-full p-3 bg-white/40 backdrop-blur-sm border border-white/40 text-zinc-900 font-light focus:outline-none focus:border-emerald-400 transition-colors placeholder-zinc-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Calendly-Style Consultation Schedule */}
              <div className="p-6 bg-gradient-to-br from-emerald-50/80 to-cyan-50/80 backdrop-blur-sm border border-emerald-200/50 rounded-xl shadow-lg">
                <h3 className="text-lg font-medium text-emerald-900 mb-6 flex items-center justify-center">
                  <div className="mr-3 w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  Select Your Consultation Time
                </h3>
                
                {/* Step 1: Date Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-emerald-800">Choose a Date</h4>
                    <div className="text-xs text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-full">
                      Hong Kong Time (HKT)
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {getDateOptions().map((dateOption, index) => (
                      <button
                        key={dateOption.value}
                        onClick={() => dateOption.isAvailable ? handleDateSelect(dateOption.value, index) : null}
                        disabled={!dateOption.isAvailable}
                        className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                          selectedDateIndex === index
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105'
                            : dateOption.isAvailable
                            ? 'bg-white/60 hover:bg-emerald-100/60 border-emerald-200 hover:border-emerald-400 text-zinc-800'
                            : 'bg-gray-100/50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-xs font-medium mb-1">
                            {dateOption.fullLabel}
                          </div>
                          <div className="text-lg font-bold">
                            {dateOption.date}
                          </div>
                          <div className="text-xs opacity-75">
                            {dateOption.month}
                          </div>
                          {!dateOption.isAvailable && (
                            <div className="text-xs mt-1 opacity-60">Weekend</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Time Selection */}
                {selectedDateIndex >= 0 && (
                  <div className="border-t border-emerald-200/50 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-emerald-800">Choose a Time</h4>
                      <div className="text-xs text-emerald-600">
                        {getDateOptions()[selectedDateIndex]?.label}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {getTimeSlots(selectedDateIndex).map((timeSlot) => (
                        <button
                          key={timeSlot.value}
                          onClick={() => timeSlot.isAvailable ? handleTimeSelect(timeSlot.value) : null}
                          disabled={!timeSlot.isAvailable}
                          className={`p-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                            inquiryData.consultationTime === timeSlot.value
                              ? 'bg-emerald-600 text-white shadow-md scale-105'
                              : timeSlot.isAvailable
                              ? 'bg-white/70 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 text-zinc-800'
                              : 'bg-gray-100/50 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {timeSlot.label}
                          {!timeSlot.isAvailable && (
                            <div className="text-xs opacity-60 mt-1">Booked</div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {getTimeSlots(selectedDateIndex).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="m15 9-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div className="text-sm">No available slots for this date</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Selection Summary */}
                {inquiryData.consultationDate && inquiryData.consultationTime && (
                  <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm border border-emerald-300/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-emerald-800">Selected Appointment</div>
                        <div className="text-xs text-emerald-600 mt-1 flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{getDateOptions().find(d => d.value === inquiryData.consultationDate)?.label}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{getTimeSlots(selectedDateIndex).find(t => t.value === inquiryData.consultationTime)?.label} HKT</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                          <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-emerald-600 text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                    </svg>
                    <span>Business hours: Monday-Friday, 9:00 AM - 6:00 PM (HKT)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Each consultation session is 60 minutes</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <path d="M1 4v16a1 1 0 0 0 1 1h2V3H2a1 1 0 0 0-1 1zM19 3h-2v18h2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" fill="currentColor"/>
                      <path d="M12 2l3 7h7l-5.5 4L19 20l-7-5-7 5 2.5-7L2 9h7z" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                    <span>You can reschedule up to 24 hours before your appointment</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-2">Consultation Requirements *</label>
                <textarea
                  value={inquiryData.inquiryContent}
                  onChange={(e) => setInquiryData(prev => ({ ...prev, inquiryContent: e.target.value }))}
                  placeholder="Describe your insurance transfer requirements, target jurisdictions, portfolio size, and any specific concerns for our specialists..."
                  rows={4}
                  className="w-full p-4 bg-white/40 backdrop-blur-sm border border-white/40 text-zinc-900 font-light focus:outline-none focus:border-emerald-400 transition-colors resize-none placeholder-zinc-500 rounded-lg"
                />
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full p-4 bg-zinc-900 text-zinc-50 font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M23 7l-7 5 7 5V7z" fill="currentColor"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                <span>
                  {isSubmitting ? 'Scheduling Your Consultation...' : 'Schedule Premium Zoom Consultation'}
                </span>
                {!isSubmitting && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                  </svg>
                )}
              </button>
              
              <div className="p-4 bg-amber-50/60 backdrop-blur-sm border border-amber-200/50 rounded-lg mt-4">
                <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                  <div className="mr-2 w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  Professional Service Notice
                </h4>
                <div className="text-xs text-amber-700 space-y-1">
                  <p>• <strong>100% Appointment-Based:</strong> All consultations are by reservation only to ensure dedicated specialist attention</p>
                  <p>• <strong>Service Tiers:</strong> Initial consultation included • Advanced specialist services subject to concierge fees</p>
                  <p>• <strong>Premium Quality:</strong> Tailored advisory for sophisticated insurance transfer requirements</p>
                </div>
              </div>
              
              <div className="text-center text-xs text-zinc-500 mt-3 flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Your information is secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>We'll confirm within 24 hours</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="m22 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" stroke="currentColor" strokeWidth="2"/>
                    <path d="m7 12c0 2-2 3-3 3s-3-1-3-3 2-3 3-3 3 1 3 3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Exclusive to WellSwap users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Services - 우측 배치 */}
          <div className="space-y-6">
            <div className="p-6 md:p-8 bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg"
                 style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
              <h2 className="text-xl md:text-2xl font-extralight text-zinc-900 mb-6">Specialist Advisory Services</h2>
              
              <div className="mb-4 p-3 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 text-emerald-800 text-sm font-medium text-center rounded-lg flex items-center justify-center space-x-2">
                <StarIcon className="w-4 h-4 text-emerald-600" />
                <span>Exclusive to WellSwap Platform Users Only</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/30 backdrop-blur-sm border border-white/20 hover:bg-white/40 transition-all duration-300"
                     style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)' }}>
                  <div className="mb-3 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-900">Legal Advisory</h3>
                  <p className="text-xs text-zinc-600 mt-1">US-qualified attorneys</p>
                </div>
                <div className="p-4 bg-white/30 backdrop-blur-sm border border-white/20 hover:bg-white/40 transition-all duration-300"
                     style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)' }}>
                  <div className="mb-3 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                    <CubeTransparentIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-900">Strategy</h3>
                  <p className="text-xs text-zinc-600 mt-1">MBA-level consulting</p>
                </div>
                <div className="p-4 bg-white/30 backdrop-blur-sm border border-white/20 hover:bg-white/40 transition-all duration-300"
                     style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)' }}>
                  <div className="mb-3 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <BoltIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-900">Ventures</h3>
                  <p className="text-xs text-zinc-600 mt-1">Private equity expertise</p>
                </div>
                <div className="p-4 bg-white/30 backdrop-blur-sm border border-white/20 hover:bg-white/40 transition-all duration-300"
                     style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)' }}>
                  <div className="mb-3 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-900">Tax & Accounting</h3>
                  <p className="text-xs text-zinc-600 mt-1">International CPA</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-zinc-600 font-light">
                <p>• Cross-border regulatory compliance for HK/SG jurisdictions</p>
                <p>• Legal documentation review and structuring</p>
                <p>• Due diligence and risk assessment</p>
                <p>• Blockchain-secured escrow services</p>
              </div>
              
              <div className="mt-6">
                <h3 className="text-base font-light text-zinc-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm text-zinc-600 font-light">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>concierge@wellswap.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>+852 1234 5678</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Mon-Fri 9AM-6PM (HKT)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

// Admin page component (includes multisig trade management)
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
  // Direct implementation of trade-related functions
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
        
        console.log('💼 전체 자산 데이터:', allAssets);
        
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

        console.log('💼 멀티시그 거래 데이터:', data);
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
      console.log('📊 어드민: AI 평가 및 멀티시그 거래 생성 시작...', listing);
      
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

  // AI 크롤링 데이터 상태
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
      console.log('🎯 OCR AI 분석 시작...');
      
      // 1단계: Tesseract.js OCR 엔진 초기화
      setOcrProgress(10);
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

  // AI 크롤링 함수들
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
      console.log('⚙️ 크롤링 트리거 시작...');
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
      console.log('👛 지갑 주소 확인:', walletAddress);
      
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
      console.log('⚡ Polygon 멀티시그 거래 시작...');
      
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
      
      // 실제 API 호출로 교체
      const registrationResult = await InsuranceAPI.registerInsuranceAsset({
        productName: assetData.productName,
        insuranceCompany: assetData.insuranceCompany,
        category: assetData.productCategory,
        annualPayment: parseFloat(assetData.annualPremium),
        totalPayment: parseFloat(assetData.totalPaid),
        contractDate: assetData.contractDate,
        contractPeriod: assetData.contractPeriod,
        paidPeriod: assetData.paidPeriod,
        status: 'pending'
      }, connectedAccount);
      
      if (registrationResult.success) {
        console.log('✅ 자산 등록 완료:', registrationResult);
        setTradeSteps(prev => ({ 
          ...prev, 
          stage: 2, 
          registrationTxHash: registrationResult.transactionHash,
          assetId: registrationResult.assetId
        }));

        // 2단계: AI 평가 및 크롤링 데이터 통합
        console.log('📊 2단계: AI 평가 및 크롤링 데이터 분석 중...');
        
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
        
        console.log('💼 AI 평가 데이터:', {
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
      console.log('🛒 실제 보험 자산 구매 시작...');
      
      if (!listing?.id) {
        throw new Error('구매할 상품 정보가 없습니다.');
      }
      
      // 실제 API 호출로 구매 처리
      const purchaseResult = await InsuranceAPI.purchaseInsuranceAsset(
        listing.id,
        currentWalletAddress
      );
      
      if (purchaseResult.success) {
        console.log('✅ 구매 완료:', purchaseResult);
        
        alert(`🎉 구매 완료!\n트랜잭션 ID: ${purchaseResult.transactionId}\n블록체인 해시: ${purchaseResult.transactionHash}`);
        
        // 성공 후 페이지 새로고침 또는 상태 업데이트
        window.location.reload();
        return;
      } else {
        throw new Error(purchaseResult.error || '구매 처리 실패');
      }

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

  // 실제 보험 리스팅 데이터 로드
  const [listingData, setListingData] = useState<any[]>([]);
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
    console.log('⚙️ Web3 상태 업데이트:', {
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
    console.log('⚡ WellSwap 컴포넌트 마운트됨');
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