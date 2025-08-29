'use client';

import React, { useState, useCallback } from 'react';
import { Camera, Upload } from 'lucide-react';
import { SafeInput } from '../SafeInput';
import {
  ParallaxSection,
  FadeInAnimation,
  TypewriterText,
  GradientBackground
} from '../animations/AnimationComponents';

interface SellInsurancePageProps {
  t: any;
  insuranceData: any;
  setInsuranceData: React.Dispatch<React.SetStateAction<any>>;
  handleRefChange: (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFinalChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
  selectedFile: File | null;
  isUsingCamera: boolean;
  isOcrProcessing: boolean;
  ocrProgress: number;
  ocrResult: any;
  startCamera: () => void;
  stopCamera: () => void;
  capturePhoto: () => void;
  handleFileUpload: () => void;
  processOCR: () => void;
  fulfillmentData: any;
  isCrawling: boolean;
  fetchFulfillmentData: (insurerName: string, productType: string, policyYear?: number) => Promise<any>;
  triggerCrawling: () => void;
}

export default function SellInsurancePage({
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
  fulfillmentData,
  isCrawling,
  fetchFulfillmentData,
  triggerCrawling
}: SellInsurancePageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          <TypewriterText 
            text="SELL"
            speed={150}
            delay={500}
            repeat={true}
            pauseAfterComplete={2000}
            className=""
          />
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200" style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span className="font-light text-zinc-700">Multisig Authentication Required</span>
        </div>
        <button 
          onClick={connectWalletWithAuth}
          className="px-4 py-2 bg-zinc-900 text-zinc-50 font-light text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50" 
          style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)'}}
        >
          {isAuthenticated ? 'Connected' : 'Connect Wallet'}
        </button>
      </div>
      
      <div className="max-w-6xl">
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">{t.globalInsuranceRegistration}</p>
      </div>
      
      <div className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">{t.insuranceInfo}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSellSubmitWithStats(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">{t.insuranceCompany}</label>
                <select 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={insuranceData.company}
                  onChange={handleRefChange('company')}
                >
                  <option value="">{t.selectCompany}</option>
                  {globalInsurers.map(insurer => (
                    <option key={insurer} value={insurer}>{insurer}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">{t.productCategory}</label>
                <select 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={insuranceData.productCategory}
                  onChange={handleRefChange('productCategory')}
                >
                  <option value="">{t.selectCategory}</option>
                  {globalCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
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
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">{t.contractDate}</label>
                <div className="relative">
                  <input
                    id="contract-date-input"
                    type="date"
                    value={insuranceData.contractDate || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('📅 날짜 입력:', value);
                      setInsuranceData((prev: any) => ({ ...prev, contractDate: value }));
                    }}
                    className="w-full p-4 pr-12 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('contract-date-input') as HTMLInputElement;
                      if (input) {
                        input.showPicker?.() || input.click();
                      }
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">{t.contractPeriod}</label>
                <select 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={insuranceData.contractPeriod}
                  onChange={handleRefChange('contractPeriod')}
                >
                  <option value="">{t.selectPeriod}</option>
                  {contractPeriods.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">{t.actualPaymentPeriod}</label>
                <select 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={insuranceData.actualPaymentPeriod}
                  onChange={handleRefChange('actualPaymentPeriod')}
                >
                  <option value="">{t.selectPeriod}</option>
                  {paidPeriods.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">{t.annualPayment}</label>
                <SafeInput
                  type="number"
                  value={insuranceData.annualPayment}
                  onChange={(value) => setInsuranceData((prev: any) => ({ ...prev, annualPayment: value }))}
                  placeholder={t.example}
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                />
              </div>
              
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
              
              <button
                type="submit"
                disabled={isLoading || !isAuthenticated || !isWeb3Connected}
                className="w-full p-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
              >
                {isLoading ? '🔄 Step 1: Multisig Registration in Progress...' : 
                  !isAuthenticated || !isWeb3Connected ? 'Multisig Authentication Required' : 
                  '🔄 Step 1: Multisig Registration (300 USD)'}
              </button>
            </form>
          </div>
          
          <div className="space-y-6">
            {/* AI 크롤링 시스템 정보 */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">AI Automation Crawling System</h4>
              <p className="text-purple-700 text-sm mb-3">
                Global insurance company fulfillment rate data is crawled to reflect weights in AI valuation and improve accuracy.
              </p>
              {fulfillmentData && (
                <div className="text-sm text-purple-700">
                  <p>Adjustment Factor: {fulfillmentData.adjustmentFactor?.toFixed(2) || 'N/A'}</p>
                  <p>Reliability Score: {fulfillmentData.reliabilityScore?.toFixed(2) || 'N/A'}</p>
                  <p>Recommendation: {fulfillmentData.recommendation || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
