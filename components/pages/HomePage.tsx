'use client';
import React from 'react';
import { ChartBar, Globe, Shield } from 'lucide-react';

interface HomePageProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function HomePage({ currentPage, setCurrentPage }: HomePageProps) {
  if (currentPage !== 'home') return null;

  return (
    <div className="space-y-16">
      <div className="text-center space-y-8">
        <div className="relative">
          <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none relative z-10">
            <span className=""><span className="animate-pulse">|</span></span>
          </h1>
        </div>
        <div className="w-32 h-px bg-zinc-900 mx-auto mb-8"></div>
        <p className="text-lg sm:text-xl md:text-2xl text-zinc-600 font-light tracking-wide max-w-4xl mx-auto">
          Transfer Insurance Assets Globally
        </p>
        <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-light max-w-3xl mx-auto">
          AI-powered insurance asset trading platform for Hong Kong, Singapore, and international markets
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button 
            onClick={() => setCurrentPage('sell')}
            className="px-8 py-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transition-all duration-300" 
            style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
          >
            Get Started
          </button>
          <button 
            onClick={() => setCurrentPage('buy')}
            className="px-8 py-4 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors" 
            style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
          >
            Learn More
          </button>
          <button 
            onClick={() => {
              // Solflare 지갑 연결 모달 표시
              const event = new CustomEvent('showWalletConnect');
              window.dispatchEvent(event);
            }}
            className="px-8 py-4 bg-blue-600 text-white font-light hover:bg-blue-700 transition-all duration-300" 
            style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
          >
            Connect Wallet
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl md:text-6xl font-extralight text-zinc-900">
            <span className="">0M+</span>
          </div>
          <div className="text-xs sm:text-sm text-zinc-600 font-light tracking-wide">Trading Volume</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl md:text-6xl font-extralight text-zinc-900">
            <span className="">0K+</span>
          </div>
          <div className="text-xs sm:text-sm text-zinc-600 font-light tracking-wide">Active Users</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl md:text-6xl font-extralight text-zinc-900">
            <span className="">0%</span>
          </div>
          <div className="text-xs sm:text-sm text-zinc-600 font-light tracking-wide">Success Rate</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4" style={{clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)'}}>
          <ChartBar className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
          <h3 className="text-lg md:text-xl font-light text-zinc-900">AI Valuation</h3>
          <p className="text-sm md:text-base text-zinc-600 font-light">Advanced mathematical models with actuarial science</p>
        </div>
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4" style={{clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)'}}>
          <Globe className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
          <h3 className="text-lg md:text-xl font-light text-zinc-900">Global Market</h3>
          <p className="text-sm md:text-base text-zinc-600 font-light">Hong Kong, Singapore, UK, US markets</p>
        </div>
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4" style={{clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)'}}>
          <Shield className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
          <h3 className="text-lg md:text-xl font-light text-zinc-900">Secure Trading</h3>
          <p className="text-sm md:text-base text-zinc-600 font-light">Blockchain-based multi-signature contracts</p>
        </div>
      </div>
    </div>
  );
}
