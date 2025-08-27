'use client';

// WellSwapComplete.tsx — Refactored
// 4개 페이지 컴포넌트를 최상단으로 호이스팅 + React.memo
// SafeInput V2 포함 (IME/커서 안정)

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
import { Camera, Upload, User, Menu, X, Wallet, ArrowRight, Globe, MessageSquare, BarChart3, TrendingUp, Shield, CheckCircle2, AlertCircle, Clock, DollarSign, Key, Lock, Users } from 'lucide-react';

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
export const HomePage = React.memo(function HomePage({ t, setCurrentPage }: { t: any; setCurrentPage: (page: string) => void; }) {
  return (
    <div className="space-y-16">
      <div className="text-center space-y-8">
        <div className="relative">
          <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none relative z-10">
            <TypewriterText 
              text={t.mainTitle}
              speed={150}
              delay={500}
              repeat={true}
              pauseAfterComplete={2000}
              className=""
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
  globalInsurers,
  globalCategories,
  contractPeriods,
  paidPeriods,
  calculatePaymentOptions,
  handleRefChange,
  handleFinalChange,
}: {
  t: any;
  insuranceData: any;
  setInsuranceData: any;
  globalInsurers: string[];
  globalCategories: string[];
  contractPeriods: string[];
  paidPeriods: string[];
  calculatePaymentOptions: (x: any) => any;
  handleRefChange: (f: string) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFinalChange: (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          SELL
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
      </div>

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
                onChange={(e) => setInsuranceData((prev: any) => ({ ...prev, company: e.target.value }))}
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

            {/* 계약일 */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.contractDate}</label>
              <SafeInput
                type="text"
                value={insuranceData.startDate}
                onChange={(value) => setInsuranceData((prev: any) => ({ ...prev, startDate: value }))}
                placeholder="YYYY-MM-DD"
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                pattern="\\d{4}-\\d{2}-\\d{2}"
                maxLength={10}
              />
            </div>

            {/* 계약 기간 */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.contractPeriod}</label>
              <select
                value={insuranceData.contractPeriod}
                onChange={(e) => setInsuranceData((prev: any) => ({ ...prev, contractPeriod: e.target.value }))}
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
                onChange={(value) => setInsuranceData((prev: any) => ({ ...prev, customContractPeriod: value }))}
                placeholder={t.example}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* 납입 기간 */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.paidPeriod}</label>
              <select
                value={insuranceData.actualPaymentPeriod}
                onChange={(e) => setInsuranceData((prev: any) => ({ ...prev, actualPaymentPeriod: e.target.value }))}
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

            {/* 연간 보험료 */}
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

            {/* 총 납입액 */}
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

            {/* 제출 버튼 */}
            <button
              className="w-full p-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transform hover:translate-x-2 hover:translate-y-2 transition-all duration-300"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
            >
              {t.submitSell}
            </button>
          </div>

          {/* OCR 업로드 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">{t.documentScan}</h2>
            <div 
              className="border-2 border-dashed border-zinc-300 p-8 text-center bg-zinc-50 hover:border-zinc-400 transition-colors cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
            >
              <Camera className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-zinc-600 font-light">
                {t.insuranceDocumentScan}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                {t.jpgPngSupported}
              </p>
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
  globalCategories,
}: {
  t: any;
  insuranceData: any;
  setInsuranceData: any;
  globalCategories: string[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          BUY
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
          {t.globalInsuranceTransferProductSearch}
        </p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-zinc-500 font-light">Buy page content will be implemented here.</p>
      </div>
    </div>
  );
});

//
// ✅ InquiryPage
//
export const InquiryPage = React.memo(function InquiryPage({ t }: { t: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          CONCIERGE
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
          {t.insuranceTransferExpert}
        </p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-zinc-500 font-light">Inquiry page content will be implemented here.</p>
      </div>
    </div>
  );
});

//
// ✅ 메인 컴포넌트
//
export default function WellSwapGlobalPlatform() {
  const [currentPage, setCurrentPage] = useState("home");
  const [insuranceData, setInsuranceData] = useState({});

  const memoizedInsuranceData = useMemo(() => insuranceData, [insuranceData]);

  const globalInsurers = ["삼성", "교보", "한화"];
  const globalCategories = ["저축", "연금"];
  const contractPeriods = ["5년", "10년", "20년"];
  const paidPeriods = ["5년납", "10년납"];
  const calculatePaymentOptions = useCallback((period: string) => {
    if (!period || period === 'Custom Input') return [];
    
    const periodMap: { [key: string]: number } = {
      '2년': 2, '3년': 3, '5년': 5, '10년': 10,
      '15년': 15, '20년': 20, '25년': 25, '30년': 30
    };
    
    const years = periodMap[period];
    if (!years) return [];
    
    return Array.from({ length: years }, (_, i) => `${i + 1}년`);
  }, []);

  const handleRefChange = (field: string) => (e: any) =>
    setInsuranceData((prev: any) => ({ ...prev, [field]: e.target.value }));

  const handleFinalChange = (field: string) => (e: any) =>
    setInsuranceData((prev: any) => ({ ...prev, [field]: e.target.value }));

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
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div style={{ display: currentPage === "home" ? "block" : "none" }}>
          <HomePage t={t} setCurrentPage={setCurrentPage} />
        </div>

        <div style={{ display: currentPage === "sell" ? "block" : "none" }}>
          <SellInsurancePage
            t={t}
            insuranceData={memoizedInsuranceData}
            setInsuranceData={setInsuranceData}
            globalInsurers={globalInsurers}
            globalCategories={globalCategories}
            contractPeriods={contractPeriods}
            paidPeriods={paidPeriods}
            calculatePaymentOptions={calculatePaymentOptions}
            handleRefChange={handleRefChange}
            handleFinalChange={handleFinalChange}
          />
        </div>

        <div style={{ display: currentPage === "buy" ? "block" : "none" }}>
          <BuyInsurancePage
            t={t}
            insuranceData={memoizedInsuranceData}
            setInsuranceData={setInsuranceData}
            globalCategories={globalCategories}
          />
        </div>

        <div style={{ display: currentPage === "inquiry" ? "block" : "none" }}>
          <InquiryPage t={t} />
        </div>
      </main>
    </div>
  );
}