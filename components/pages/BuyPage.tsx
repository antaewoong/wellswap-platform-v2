'use client';
import React, { useState, useCallback } from 'react';
import { Wallet, Clock } from 'lucide-react';

interface BuyPageProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function BuyPage({ currentPage, setCurrentPage }: BuyPageProps) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletConnect = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts'
        });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  }, []);

  if (currentPage !== 'buy') return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          <span className=""><span className="animate-pulse">|</span></span>
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">Browse available insurance transfers globally</p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900 mb-4">Available Insurance Products</h2>
        <p className="text-zinc-600">Browse and purchase insurance products from leading Hong Kong insurers</p>
        
        {!isWalletConnected && (
          <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="font-light text-zinc-700">Wallet not connected</span>
              </div>
              <button 
                onClick={handleWalletConnect}
                className="px-4 py-2 bg-zinc-900 text-zinc-50 font-light text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* AIA Savings Plan */}
        <div className="p-6 border border-zinc-200 bg-zinc-50 hover:border-zinc-400 transition-colors rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-2">
            <div className="flex-1">
              <h3 className="font-light text-xl text-zinc-900 mb-1">AIA Savings Plan</h3>
              <p className="text-sm text-zinc-600 mb-2">AIA Group Limited</p>
              <span className="inline-block px-3 py-1 text-xs bg-zinc-200 text-zinc-700 rounded">Savings Plan</span>
            </div>
            <div className="px-3 py-1 text-xs rounded-full shrink-0 bg-green-100 text-green-700">Available</div>
          </div>
          
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Contract Period:</span>
              <span className="text-zinc-900 font-medium">10 Years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Paid Period:</span>
              <span className="text-zinc-900 font-medium">5 Years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Annual Premium:</span>
              <span className="text-zinc-900 font-medium">$3,000</span>
            </div>
          </div>
          
          <div className="border-t border-zinc-300 pt-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-zinc-600">Surrender Value:</span>
              <span className="text-lg font-medium text-zinc-700">$12,000</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-zinc-600">Transfer Value:</span>
              <span className="text-lg font-medium text-zinc-900">$11,500</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-zinc-600">Platform Price:</span>
              <span className="text-xl font-medium text-zinc-900">$15,000</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-600">AI Confidence:</span>
              <span className="text-sm font-medium text-green-600">95.0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-600">Risk Grade:</span>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">A</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              disabled={!isWalletConnected}
              className="w-full p-3 bg-zinc-900 text-zinc-50 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              {isWalletConnected ? 'Purchase Now' : 'Connect Wallet to Purchase'}
            </button>
            <button className="w-full p-3 border border-zinc-300 text-zinc-700 text-sm font-medium hover:border-zinc-400 hover:bg-zinc-100 transition-colors rounded">
              1:1 Inquiry
            </button>
          </div>
        </div>

        {/* Prudential Pension Plan */}
        <div className="p-6 border border-zinc-200 bg-zinc-50 hover:border-zinc-400 transition-colors rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-2">
            <div className="flex-1">
              <h3 className="font-light text-xl text-zinc-900 mb-1">Prudential Pension Plan</h3>
              <p className="text-sm text-zinc-600 mb-2">Prudential plc</p>
              <span className="inline-block px-3 py-1 text-xs bg-zinc-200 text-zinc-700 rounded">Pension Plan</span>
            </div>
            <div className="px-3 py-1 text-xs rounded-full shrink-0 bg-green-100 text-green-700">Available</div>
          </div>
          
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Contract Period:</span>
              <span className="text-zinc-900 font-medium">15 Years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Paid Period:</span>
              <span className="text-zinc-900 font-medium">10 Years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Annual Premium:</span>
              <span className="text-zinc-900 font-medium">$4,000</span>
            </div>
          </div>
          
          <div className="border-t border-zinc-300 pt-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-zinc-600">Surrender Value:</span>
              <span className="text-lg font-medium text-zinc-700">$18,000</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-zinc-600">Transfer Value:</span>
              <span className="text-lg font-medium text-zinc-900">$17,200</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-zinc-600">Platform Price:</span>
              <span className="text-xl font-medium text-zinc-900">$22,000</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-600">AI Confidence:</span>
              <span className="text-sm font-medium text-green-600">88.0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-600">Risk Grade:</span>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">A</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              disabled={!isWalletConnected}
              className="w-full p-3 bg-zinc-900 text-zinc-50 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              {isWalletConnected ? 'Purchase Now' : 'Connect Wallet to Purchase'}
            </button>
            <button className="w-full p-3 border border-zinc-300 text-zinc-700 text-sm font-medium hover:border-zinc-400 hover:bg-zinc-100 transition-colors rounded">
              1:1 Inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
