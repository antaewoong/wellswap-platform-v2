'use client';

import React, { useState, useEffect, memo } from 'react';
import { supabase } from '../lib/database-wellswap';
import { 
  getRegistrationFee, 
  getPlatformFeePercent, 
  setRegistrationFee, 
  setPlatformFeePercent,
  setPlatformPrice 
} from './PolygonContractIntegration';
import { 
  Settings, 
  DollarSign, 
  Percent, 
  Save, 
  Eye, 
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  AnimatedCard,
  LoadingSpinner,
  AnimatedButton,
  FadeInAnimation
} from './animations/AnimationComponents';

interface AdminPanelOptimizedProps {
  isAdmin: boolean;
  user: any;
}

const AdminPanelOptimized = memo<AdminPanelOptimizedProps>(({ isAdmin, user }) => {
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'loading' | 'error'>('loading');
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  
  // 수수료 설정 상태
  const [currentRegFee, setCurrentRegFee] = useState('0.01');
  const [currentPlatformFee, setCurrentPlatformFee] = useState('2.5');
  const [newRegFee, setNewRegFee] = useState('0.01');
  const [newPlatformFee, setNewPlatformFee] = useState('2.5');
  
  // 가격 설정 상태
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [confirmedPrice, setConfirmedPrice] = useState('');
  
  useEffect(() => {
    const initializeAdmin = async () => {
      if (!isAdmin) return;
      
      try {
        setDbStatus('loading');
        
        // 데이터베이스 연결 확인
        const { data, error } = await supabase.from('insurance_listings').select('count').limit(1);
        if (error) {
          console.error('데이터베이스 연결 오류:', error);
          setDbStatus('error');
        } else {
          setDbStatus('connected');
        }
        
        // 현재 수수료 정보 가져오기
        const feeResult = await getRegistrationFee();
        const platformFeeResult = await getPlatformFeePercent();
        
        if (feeResult.success) {
          setCurrentRegFee(feeResult.fee);
          setNewRegFee(feeResult.fee);
        }
        
        if (platformFeeResult.success) {
          setCurrentPlatformFee(platformFeeResult.feePercent.toString());
          setNewPlatformFee(platformFeeResult.feePercent.toString());
        }
        
        // 대기 중인 리스팅 가져오기
        await fetchPendingListings();
        
      } catch (error) {
        console.error('관리자 패널 초기화 실패:', error);
        setDbStatus('error');
      }
    };

    initializeAdmin();
  }, [isAdmin]);

  const fetchPendingListings = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_listings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('대기 리스팅 조회 실패:', error);
      } else {
        setPendingListings(data || []);
      }
    } catch (error) {
      console.error('대기 리스팅 조회 오류:', error);
    }
  };

  const handleUpdateRegistrationFee = async () => {
    if (!newRegFee || parseFloat(newRegFee) <= 0) {
      alert('올바른 등록비를 입력하세요');
      return;
    }

    setLoading(true);
    try {
      const result = await setRegistrationFee(newRegFee);
      if (result.success) {
        setCurrentRegFee(newRegFee);
        alert('등록비가 성공적으로 변경되었습니다!');
      } else {
        alert('등록비 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('등록비 변경 오류:', error);
      alert('등록비 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlatformFee = async () => {
    const fee = parseFloat(newPlatformFee);
    if (!newPlatformFee || fee <= 0 || fee > 10) {
      alert('0% ~ 10% 사이의 수수료율을 입력하세요');
      return;
    }

    setLoading(true);
    try {
      const result = await setPlatformFeePercent(fee);
      if (result.success) {
        setCurrentPlatformFee(newPlatformFee);
        alert('플랫폼 수수료율이 성공적으로 변경되었습니다!');
      } else {
        alert('플랫폼 수수료율 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('플랫폼 수수료율 변경 오류:', error);
      alert('플랫폼 수수료율 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPlatformPrice = async (listing: any) => {
    if (!confirmedPrice || parseFloat(confirmedPrice) <= 0) {
      alert('올바른 가격을 입력하세요');
      return;
    }

    setLoading(true);
    try {
      // 블록체인에서 가격 설정
      const result = await setPlatformPrice(
        listing.blockchain_asset_id || listing.id,
        confirmedPrice
      );

      if (result.success) {
        // 데이터베이스 업데이트
        const { error } = await supabase
          .from('insurance_listings')
          .update({
            platform_price: parseFloat(confirmedPrice),
            status: 'available',
            updated_at: new Date()
          })
          .eq('id', listing.id);

        if (!error) {
          alert('가격이 성공적으로 설정되었습니다!');
          await fetchPendingListings();
          setSelectedListing(null);
          setConfirmedPrice('');
        } else {
          console.error('데이터베이스 업데이트 실패:', error);
          alert('데이터베이스 업데이트에 실패했습니다.');
        }
      } else {
        alert('블록체인 가격 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('가격 설정 오류:', error);
      alert('가격 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한 없음</h2>
        <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FadeInAnimation>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">관리자 패널</h2>
          <p className="text-gray-600">WellSwap 플랫폼 관리 및 설정</p>
        </div>
      </FadeInAnimation>

      {/* 데이터베이스 상태 */}
      <AnimatedCard className="mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">시스템 상태</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              dbStatus === 'connected' ? 'bg-green-100 text-green-800' :
              dbStatus === 'loading' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {dbStatus === 'connected' ? '✅ 연결됨' :
               dbStatus === 'loading' ? '🔄 연결 중' :
               '❌ 연결 실패'}
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* 수수료 설정 섹션 */}
      <AnimatedCard>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Settings className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold">수수료 설정</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 등록비 설정 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                등록비 (USDC)
              </label>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  현재: <span className="font-medium">{currentRegFee} USDC</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newRegFee}
                  onChange={(e) => setNewRegFee(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="새 등록비"
                />
                <AnimatedButton
                  onClick={handleUpdateRegistrationFee}
                  disabled={loading || newRegFee === currentRegFee}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  등록비 변경
                </AnimatedButton>
              </div>
            </div>

            {/* 플랫폼 수수료율 설정 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Percent className="w-4 h-4 inline mr-1" />
                플랫폼 수수료율 (%)
              </label>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  현재: <span className="font-medium">{currentPlatformFee}%</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={newPlatformFee}
                  onChange={(e) => setNewPlatformFee(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="새 수수료율"
                />
                <AnimatedButton
                  onClick={handleUpdatePlatformFee}
                  disabled={loading || newPlatformFee === currentPlatformFee}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  수수료율 변경
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* 대기 중인 리스팅 관리 */}
      <AnimatedCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">가격 승인 대기 중</h3>
            <AnimatedButton
              onClick={fetchPendingListings}
              className="bg-gray-600 hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </AnimatedButton>
          </div>

          {pendingListings.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600">대기 중인 리스팅이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingListings.map((listing) => (
                <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{listing.product_name}</h4>
                      <p className="text-sm text-gray-600">{listing.company}</p>
                      <div className="mt-2 text-sm space-y-1">
                        <div>카테고리: <span className="font-medium">{listing.category}</span></div>
                        <div>AI 평가가: <span className="font-medium">${listing.ai_valuation?.toLocaleString()}</span></div>
                        <div>연간 보험료: <span className="font-medium">${listing.annual_payment?.toLocaleString()}</span></div>
                      </div>
                    </div>
                    
                    <div className="ml-4 min-w-[200px]">
                      {selectedListing?.id === listing.id ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            step="0.01"
                            value={confirmedPrice}
                            onChange={(e) => setConfirmedPrice(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="플랫폼 가격 ($)"
                          />
                          <div className="flex gap-2">
                            <AnimatedButton
                              onClick={() => handleSetPlatformPrice(listing)}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1"
                            >
                              승인
                            </AnimatedButton>
                            <AnimatedButton
                              onClick={() => {
                                setSelectedListing(null);
                                setConfirmedPrice('');
                              }}
                              className="bg-gray-400 hover:bg-gray-500 text-xs px-3 py-1"
                            >
                              취소
                            </AnimatedButton>
                          </div>
                        </div>
                      ) : (
                        <AnimatedButton
                          onClick={() => {
                            setSelectedListing(listing);
                            setConfirmedPrice(listing.ai_valuation?.toString() || '');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          가격 설정
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
});

AdminPanelOptimized.displayName = 'AdminPanelOptimized';

export default AdminPanelOptimized;