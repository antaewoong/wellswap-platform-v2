import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/database-wellswap';

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  inquiry_content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminInquiryPanelProps {
  user: any;
}

// 어드민 지갑 주소 목록 (솔라나 주소 포함)
const ADMIN_WALLETS = [
  'HhYmywR1Nr9YWgT4NbBHsa6F8y2viYWhVbsy4s2J38kg', // 솔라나 관리자 주소
  '0x8a627a75d04bf3c709154205dfbbb6f4ed10dcb0',
  '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
  '0x9b1a5f8709c6710650a010b4c9c16b1f9a5f8709',
  '0x1a2b3c4d5e6f7890123456789012345678901234',
  '0x5a6b7c8d9e0f1234567890123456789012345678',
  '0x9c8b7a6f5e4d3c2b1a098765432109876543210'
];

export const AdminInquiryPanel: React.FC<AdminInquiryPanelProps> = ({ user }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // 상담 신청 목록 로드
  const loadInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('상담 신청 로드 실패:', error);
        return;
      }

      setInquiries(data || []);
    } catch (error) {
      console.error('상담 신청 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 상태 업데이트
  const updateInquiryStatus = async (inquiryId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          status,
          admin_notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId);

      if (error) {
        console.error('상태 업데이트 실패:', error);
        alert('상태 업데이트에 실패했습니다.');
        return;
      }

      alert('상태가 업데이트되었습니다.');
      loadInquiries();
      setSelectedInquiry(null);
      setAdminNotes('');
    } catch (error) {
      console.error('상태 업데이트 중 오류:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 기존 불필요한 ref 제거 (성능 최적화 완료)

  // 주소 문자열만 의존하게 (user 객체 전체 X)
  const userAddressStr = useMemo(() => {
    if (!user) return null;
    return user.wallet_address || user.publicKey || user.address || null;
  }, [user]);

  // 관리자 권한 캐시
  const adminResultCache = useRef<Map<string, boolean>>(new Map());

  // 어드민 권한 확인 (솔라나 주소 지원) - 최적화된 버전
  const isAdmin = useMemo(() => {
    if (!userAddressStr) return false;
    
    // 캐시에서 결과 확인
    if (adminResultCache.current.has(userAddressStr)) {
      return adminResultCache.current.get(userAddressStr)!;
    }
    
    const accountStr = userAddressStr.toString().toLowerCase();
    const isAdminWallet = ADMIN_WALLETS.some(wallet => 
      wallet.toLowerCase() === accountStr
    );
    
    // 결과를 캐시에 저장
    adminResultCache.current.set(userAddressStr, isAdminWallet);
    
    return isAdminWallet;
  }, [userAddressStr]);

  useEffect(() => {
    if (isAdmin) {
      loadInquiries();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6 bg-zinc-50 border border-zinc-200">
        <div className="text-center">
          <p className="text-zinc-600">어드민 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-zinc-50 border border-zinc-200">
        <div className="text-center">
          <p className="text-zinc-600">상담 신청 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 자동 수수료 회수 관리 */}
      <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-light text-zinc-900">61일 자동 수수료 회수 관리</h3>
          </div>
          <button className="px-4 py-2 bg-orange-600 text-white text-sm font-light hover:bg-orange-700 transition-colors rounded">
            대상 확인
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded border border-orange-200">
            <div className="text-2xl font-light text-zinc-900">0</div>
            <div className="text-sm text-zinc-600">회수 대상</div>
          </div>
          <div className="text-center p-4 bg-white rounded border border-orange-200">
            <div className="text-2xl font-light text-zinc-900">$0</div>
            <div className="text-sm text-zinc-600">총 회수액 (USD)</div>
          </div>
          <div className="text-center p-4 bg-white rounded border border-orange-200">
            <div className="text-2xl font-light text-zinc-900">0</div>
            <div className="text-sm text-zinc-600">처리 완료</div>
          </div>
        </div>
      </div>

      {/* 상담 신청 관리 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-light text-zinc-900">상담 신청 관리</h3>
        <button
          onClick={loadInquiries}
          className="px-4 py-2 bg-zinc-900 text-zinc-50 text-sm font-light hover:bg-zinc-800 transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* 상담 신청 목록 */}
      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500">등록된 상담 신청이 없습니다.</p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="p-4 border border-zinc-200 bg-white hover:border-zinc-400 transition-colors cursor-pointer"
              onClick={() => setSelectedInquiry(inquiry)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-zinc-900">{inquiry.name}</h4>
                  <p className="text-sm text-zinc-600">{inquiry.phone}</p>
                  {inquiry.email && (
                    <p className="text-sm text-zinc-600">{inquiry.email}</p>
                  )}
                  <p className="text-sm text-zinc-700 mt-2 line-clamp-2">
                    {inquiry.inquiry_content}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    inquiry.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    inquiry.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {inquiry.status === 'pending' ? '대기중' :
                     inquiry.status === 'in_progress' ? '진행중' :
                     inquiry.status === 'completed' ? '완료' : '취소됨'}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 상담 신청 상세 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-light text-zinc-900">상담 신청 상세</h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-zinc-500 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">이름</label>
                <p className="text-zinc-900">{selectedInquiry.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">연락처</label>
                <p className="text-zinc-900">{selectedInquiry.phone}</p>
              </div>

              {selectedInquiry.email && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700">이메일</label>
                  <p className="text-zinc-900">{selectedInquiry.email}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700">상담 내용</label>
                <p className="text-zinc-900 whitespace-pre-wrap">{selectedInquiry.inquiry_content}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">신청일</label>
                <p className="text-zinc-900">
                  {new Date(selectedInquiry.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">관리자 메모</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="관리자 메모를 입력하세요"
                  rows={3}
                  className="w-full p-3 border border-zinc-200 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => updateInquiryStatus(selectedInquiry.id, 'in_progress', adminNotes)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                >
                  진행중으로 변경
                </button>
                <button
                  onClick={() => updateInquiryStatus(selectedInquiry.id, 'completed', adminNotes)}
                  className="px-4 py-2 bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                >
                  완료로 변경
                </button>
                <button
                  onClick={() => updateInquiryStatus(selectedInquiry.id, 'cancelled', adminNotes)}
                  className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
                >
                  취소로 변경
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
