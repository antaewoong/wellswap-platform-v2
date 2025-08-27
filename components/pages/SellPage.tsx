'use client';
import React, { useState, useCallback } from 'react';
import { Camera, Upload } from 'lucide-react';

interface SellPageProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onValuationComplete: (result: any) => void;
}

export default function SellPage({ currentPage, setCurrentPage, onValuationComplete }: SellPageProps) {
  const [formData, setFormData] = useState({
    company: '',
    productType: '',
    productName: '',
    contractDate: '',
    contractPeriod: '',
    paidPeriod: '',
    annualPremium: '',
    totalPaid: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const performAIValuation = useCallback(async (data: any) => {
    // AI 평가 로직 구현
    return {
      aiValueUSD: 15000,
      riskGrade: 'A',
      confidence: 0.95
    };
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // AI 평가 로직
      const result = await performAIValuation(formData);
      onValuationComplete(result);
    } catch (error) {
      console.error('Valuation error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [formData, onValuationComplete, performAIValuation]);

  if (currentPage !== 'sell') return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          <span className=""><span className="animate-pulse">|</span></span>
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200" style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span className="font-light text-zinc-700">Multisig Authentication Required</span>
        </div>
        <button className="px-4 py-2 bg-zinc-900 text-zinc-50 font-light text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50" style={{clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)'}}>
          Multisig Authentication Required
        </button>
      </div>
      
      <div className="max-w-6xl">
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">Global Insurance Transfer Registration</p>
      </div>
      
      <div className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">Insurance Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Insurance Company</label>
                <select 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                >
                  <option value="">Select Insurance Company</option>
                  <option value="AIA Group Limited">AIA Group Limited</option>
                  <option value="Prudential plc">Prudential plc</option>
                  <option value="Manulife Financial">Manulife Financial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Product Category</label>
                <select 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={formData.productType}
                  onChange={(e) => handleInputChange('productType', e.target.value)}
                >
                  <option value="">Select Product Category</option>
                  <option value="Savings Plan">Savings Plan</option>
                  <option value="Pension Plan">Pension Plan</option>
                  <option value="Investment Linked">Investment Linked</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Product Name</label>
                <input 
                  type="text" 
                  placeholder="Enter exact product name" 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Annual Premium (USD)</label>
                <input 
                  type="number" 
                  placeholder="e.g." 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={formData.annualPremium}
                  onChange={(e) => handleInputChange('annualPremium', e.target.value)}
                />
              </div>
              
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full p-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transform hover:translate-x-2 hover:translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
              >
                {isProcessing ? 'Processing...' : 'Multisig Authentication Required'}
              </button>
            </form>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">Document Scan</h2>
            <div className="border-2 border-dashed border-zinc-300 p-8 text-center bg-zinc-50 hover:border-zinc-400 transition-colors cursor-pointer" style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}>
              <Camera className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-zinc-600 font-light">Scan or upload insurance certificate for automatic information extraction</p>
              <p className="text-xs text-zinc-500 mt-2">JPG, PNG files supported</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </button>
              <button className="px-6 py-3 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center">
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
