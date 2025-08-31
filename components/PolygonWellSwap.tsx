'use client';
import React, { useState } from 'react';
import PolygonIntegration from './PolygonContractIntegration';

// Polygon 기반 WellSwap 간단 테스트 컴포넌트
const PolygonWellSwap = () => {
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // MetaMask 연결
  const handleConnect = async () => {
    try {
      setLoading(true);
      addLog('🦊 MetaMask 연결 시도...');
      
      const wallet = await PolygonIntegration.connectMetaMask();
      setConnectedWallet(wallet);
      addLog(`✅ 연결 완료: ${wallet.address}`);
      addLog(`💰 MATIC 잔액: ${wallet.balance}`);
      
      // USDC 잔액 조회
      const usdc = await PolygonIntegration.getUSDCBalance(wallet.address);
      setUsdcBalance(usdc.balance);
      addLog(`💵 USDC 잔액: ${usdc.balance}`);
      
    } catch (error: any) {
      addLog(`❌ 연결 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 테스트 보험 자산 등록
  const handleRegister = async () => {
    try {
      setLoading(true);
      addLog('📝 보험 자산 등록 시작...');
      
      const testData = {
        insuranceCompany: '삼성화재',
        productName: '테스트 보험',
        productCategory: '생명보험',
        contractDate: '2023-01-01',
        contractPeriod: '10 Years',
        paidPeriod: '5 Years',
        annualPremium: '1000',
        totalPaid: '3000'
      };
      
      const result = await PolygonIntegration.registerInsuranceAsset(testData);
      
      if (result.success) {
        addLog(`✅ 등록 완료: 자산 ID ${result.assetId}`);
        addLog(`💳 트랜잭션: ${result.transactionHash}`);
      } else {
        addLog(`❌ 등록 실패: ${result.error}`);
      }
      
    } catch (error: any) {
      addLog(`❌ 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 가격 책정 테스트
  const handleSetPrice = async () => {
    try {
      setLoading(true);
      addLog('💰 가격 책정 시작...');
      
      const result = await PolygonIntegration.setPlatformPrice(1, '5000');
      
      if (result.success) {
        addLog(`✅ 가격 책정 완료: ${result.price} USDC`);
        addLog(`💳 트랜잭션: ${result.transactionHash}`);
      } else {
        addLog(`❌ 가격 책정 실패: ${result.error}`);
      }
      
    } catch (error: any) {
      addLog(`❌ 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 자산 구매 테스트
  const handlePurchase = async () => {
    try {
      setLoading(true);
      addLog('🛒 자산 구매 시작...');
      
      const result = await PolygonIntegration.purchaseAsset(1, '5000');
      
      if (result.success) {
        addLog(`✅ 구매 완료: ${result.amount} USDC`);
        addLog(`👤 구매자: ${result.buyer}`);
        addLog(`💳 트랜잭션: ${result.transactionHash}`);
      } else {
        addLog(`❌ 구매 실패: ${result.error}`);
      }
      
    } catch (error: any) {
      addLog(`❌ 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 거래 완료 테스트
  const handleComplete = async () => {
    try {
      setLoading(true);
      addLog('✅ 거래 완료 및 정산 시작...');
      
      const result = await PolygonIntegration.completeTransaction(1);
      
      if (result.success) {
        addLog(`✅ 정산 완료: 플랫폼 수수료 ${result.platformFee}`);
        addLog(`💳 트랜잭션: ${result.transactionHash}`);
      } else {
        addLog(`❌ 정산 실패: ${result.error}`);
      }
      
    } catch (error: any) {
      addLog(`❌ 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔗 WellSwap Polygon 통합 테스트
          </h1>
          
          {/* 연결 상태 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">연결 상태</h2>
            {connectedWallet ? (
              <div className="space-y-2">
                <p className="text-green-600">✅ MetaMask 연결됨</p>
                <p className="text-sm text-gray-600">주소: {connectedWallet.address}</p>
                <p className="text-sm text-gray-600">MATIC: {connectedWallet.balance}</p>
                <p className="text-sm text-gray-600">USDC: {usdcBalance}</p>
              </div>
            ) : (
              <p className="text-orange-600">⚠️ 지갑 연결 필요</p>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading && !connectedWallet ? '연결 중...' : '🦊 MetaMask 연결'}
            </button>

            <button
              onClick={handleRegister}
              disabled={loading || !connectedWallet}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '등록 중...' : '📝 자산 등록'}
            </button>

            <button
              onClick={handleSetPrice}
              disabled={loading || !connectedWallet}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '책정 중...' : '💰 가격 책정'}
            </button>

            <button
              onClick={handlePurchase}
              disabled={loading || !connectedWallet}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '구매 중...' : '🛒 자산 구매'}
            </button>
          </div>

          <button
            onClick={handleComplete}
            disabled={loading || !connectedWallet}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 mb-8"
          >
            {loading ? '정산 중...' : '✅ 거래 완료 & 정산'}
          </button>

          {/* 로그 출력 */}
          <div className="bg-black rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-4">🔍 실시간 로그</h3>
            <div className="bg-gray-900 rounded p-4 h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-400">로그가 여기에 표시됩니다...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-green-400 text-sm font-mono mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 정보 패널 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">📋 4단계 멀티시그 프로세스</h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. 판매자 등록 (300 USDC)</li>
                <li>2. 플랫폼 가격 책정</li>
                <li>3. 구매자 매수 (에스크로)</li>
                <li>4. 거래 완료 & 정산 (2.5% 수수료)</li>
              </ol>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-900">🌐 Polygon Mumbai 테스트넷</h3>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• Chain ID: 80001</li>
                <li>• USDC: 0x0FA8...B23</li>
                <li>• 등록비: 300 USDC</li>
                <li>• 플랫폼 수수료: 2.5%</li>
                <li>• 만료 기간: 61일</li>
              </ul>
            </div>
          </div>

          {/* 테스트 토큰 정보 */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2 text-yellow-900">🚰 테스트 토큰 받기</h3>
            <p className="text-sm text-yellow-800 mb-4">Mumbai 테스트넷에서 MATIC과 USDC를 받으세요:</p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://faucet.polygon.technology/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                MATIC Faucet
              </a>
              <span className="text-sm text-gray-600 py-2">USDC는 별도 구현 필요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolygonWellSwap;