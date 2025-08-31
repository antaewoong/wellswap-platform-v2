'use client';

import { useEffect } from 'react';

export default function SupabaseKeepAlive() {
  useEffect(() => {
    const keepAlive = async () => {
      try {
        const response = await fetch('/api/keep-alive');
        const data = await response.json();
        // 조용히 처리 - 오류시에만 로그 출력
        if (data.status !== 'alive') {
          console.warn('Supabase keep-alive issue:', data.status);
        }
      } catch (error) {
        console.error('Keep-alive failed:', error);
      }
    };

    // 즉시 실행
    keepAlive();
    
    // 30분마다 실행 (Supabase는 7일 후 pause되므로 충분한 빈도)
    const interval = setInterval(keepAlive, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // 화면에 표시되지 않는 컴포넌트
}