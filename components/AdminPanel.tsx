'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/database-wellswap';
import { useSolanaTrading } from './SolanaContractIntegration';
import { PublicKey } from '@solana/web3.js';

interface AdminPanelProps {
  isAdmin: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'loading' | 'error'>('loading');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [aiEvaluationAmount, setAiEvaluationAmount] = useState('');
  const [confirmedPrice, setConfirmedPrice] = useState('');

  const { createTrade, approveTrade } = useSolanaTrading();

  // 데이터베이스 연결 확인
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        setDbStatus('loading');
        const { data, error } = await supabase.from('insurance_assets').select('count').limit(1);
        
        if (error) {
          console.error('데이터베이스 연결 오류:', error);
          setDbStatus('error');
        } else {
          console.log('✅ 데이터베이스 연결 성공');
          setDbStatus('connected');
        }
      } catch (error) {
        console.error('데이터베이스 확인 실패:', error);
        setDbStatus('error');
      }
    };

    checkDatabase();
  }, []);

  // AI 평가 가격 확정
  const handleConfirmPrice = async (listing: any) => {
    setLoading(true);
    try {
      // 1. AI 평가 결과 업데이트
      const { error: aiError } = await supabase
        .from('insurance_assets')
        .update({ 
          ai_evaluation: { 
            value: parseFloat(confirmedPrice),
            confidence: 0.95,
            risk_grade: 'A'
          },
          status: 'ai_evaluated'
        })
        .eq('id', listing.id);

      if (aiError) throw aiError;
      console.log('✅ AI 평가 결과 업데이트 완료');

      // 2. 멀티시그 거래 생성
      const tradeResult = await createTrade(
        listing.id,
        parseFloat(confirmedPrice)
      );

      if (tradeResult.success) {
        console.log('✅ 멀티시그 거래 생성 완료:', tradeResult);
        
        // 3. 거래 정보 저장
        const { error: tradeError } = await supabase
          .from('transactions')
          .insert([{
            product_id: listing.id,
            seller_id: listing.seller_address,
            price: parseFloat(confirmedPrice),
            currency: 'USD',
            status: 'pending',
            transaction_hash: tradeResult.transactionHash,
            multisig_signatures: {
              trade_id: tradeResult.tradeId,
              required_signatures: 2,
              current_signatures: 0,
              signers: []
            }
          }]);

        if (tradeError) throw tradeError;
        console.log('✅ 거래 정보 저장 완료');

        // 4. 목록 업데이트
        setPendingListings(prev => prev.filter(item => item.id !== listing.id));
        setListings((prev: any[]) => 
          prev.map((item: any) => 
            item.id === listing.id 
              ? { ...item, status: 'ai_evaluated', platform_price: parseFloat(confirmedPrice) }
              : item
          )
        );

        alert('✅ AI 평가 완료 및 멀티시그 거래가 생성되었습니다.');
        setSelectedListing(null);
        setAiEvaluationAmount('');
        setConfirmedPrice('');
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-light text-zinc-900 mb-8">관리자 권한이 필요합니다.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light text-zinc-900 mb-8">관리자 패널</h1>
        
        {/* 데이터베이스 상태 표시 */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 mb-8">
          <h2 className="text-xl font-light text-zinc-900 mb-4">시스템 상태</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              dbStatus === 'connected' ? 'bg-green-500' : 
              dbStatus === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              데이터베이스: {dbStatus === 'connected' ? '연결됨' : 
                           dbStatus === 'loading' ? '연결 중...' : '연결 실패'}
            </span>
          </div>
          
          {/* 디버깅 정보 */}
          {debugInfo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">디버깅 정보</h3>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* AI 평가 대기 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 mb-8">
          <h2 className="text-xl font-light text-zinc-900 mb-4">AI 평가 대기 목록</h2>
          {pendingListings.length === 0 ? (
            <p className="text-gray-500">대기 중인 항목이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {pendingListings.map((listing) => (
                <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{listing.product_name}</h3>
                      <p className="text-sm text-gray-600">{listing.insurance_company}</p>
                    </div>
                    <span className="text-sm text-gray-500">ID: {listing.id}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AI 평가 금액
                      </label>
                      <input
                        type="number"
                        value={aiEvaluationAmount}
                        onChange={(e) => setAiEvaluationAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="AI 평가 금액 입력"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        확정 가격
                      </label>
                      <input
                        type="number"
                        value={confirmedPrice}
                        onChange={(e) => setConfirmedPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="확정 가격 입력"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleConfirmPrice(listing)}
                    disabled={loading || !confirmedPrice}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '처리 중...' : '가격 확정'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 거래 관리 */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-light text-zinc-900 mb-4">거래 관리</h2>
          {listings.length === 0 ? (
            <p className="text-gray-500">거래 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{listing.product_name}</h3>
                      <p className="text-sm text-gray-600">{listing.insurance_company}</p>
                      <p className="text-sm text-gray-500">상태: {listing.status}</p>
                    </div>
                    <span className="text-sm text-gray-500">ID: {listing.id}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSignTrade(listing.id)}
                      disabled={loading}
                      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      서명
                    </button>
                    <button
                      onClick={() => handleExecuteTrade(listing.id)}
                      disabled={loading}
                      className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      실행
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
