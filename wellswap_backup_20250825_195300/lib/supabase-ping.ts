// lib/supabase-ping.ts - Supabase 자동 핑 시스템
import { supabase } from './database-wellswap';

class SupabasePingService {
  private pingInterval: NodeJS.Timeout | null = null;
  private isActive = false;
  private pingCount = 0;
  private lastPingTime: Date | null = null;

  constructor() {
    // 서버 시작 시 즉시 시작하지 않고 지연 시작
    setTimeout(() => {
      this.startPing();
    }, 3000); // 3초 후 시작 (속도 개선)
  }

  // 자동 핑 시작
  startPing() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔄 Supabase 자동 핑 시작...');
    
    // 6시간마다 핑 실행 (Supabase 7일 제한 대비 충분히 안전)
    this.pingInterval = setInterval(async () => {
      await this.performPing();
    }, 6 * 60 * 60 * 1000); // 6시간
    
    // 즉시 첫 번째 핑 실행 (로딩 속도 향상을 위해 지연)
    setTimeout(() => {
      this.performPing();
    }, 5000); // 5초 후 실행
  }

  // 핑 실행
  private async performPing() {
    try {
      this.pingCount++;
      this.lastPingTime = new Date();
      
      console.log(`🔄 Supabase 핑 #${this.pingCount} 실행 중... (${this.lastPingTime.toISOString()})`);
      
      // 1. 간단한 쿼리로 연결 확인 (기존 테이블 사용)
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.warn('⚠️ Supabase 핑 쿼리 실패:', error);
        // 재연결 시도
        await this.reconnect();
      } else {
        console.log(`✅ Supabase 핑 #${this.pingCount} 성공`);
      }
      
      // 2. 연결 상태 로그 기록 (선택사항)
      await this.logPingStatus();
      
    } catch (error) {
      console.error('❌ Supabase 핑 실패:', error);
      await this.reconnect();
    }
  }

  // 재연결 시도
  private async reconnect() {
    try {
      console.log('🔄 Supabase 재연결 시도 중...');
      
      // 5초 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase 재연결 실패:', error);
      } else {
        console.log('✅ Supabase 재연결 성공');
      }
    } catch (error) {
      console.error('❌ Supabase 재연결 중 오류:', error);
    }
  }

  // 핑 상태 로그 기록 (비활성화 - 테이블 없음)
  private async logPingStatus() {
    // system_logs 테이블이 존재하지 않으므로 로그 기록 비활성화
    // console.log('📝 핑 로그 기록 생략 (테이블 없음)');
  }

  // 핑 중지
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.isActive = false;
    console.log('🛑 Supabase 자동 핑 중지');
  }

  // 상태 확인
  getStatus() {
    return {
      isActive: this.isActive,
      pingCount: this.pingCount,
      lastPingTime: this.lastPingTime,
      nextPingTime: this.lastPingTime ? 
        new Date(this.lastPingTime.getTime() + 6 * 60 * 60 * 1000) : null
    };
  }
}

// 싱글톤 인스턴스 생성
export const supabasePingService = new SupabasePingService();

// 브라우저 환경에서 페이지 언로드 시 핑 중지
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    supabasePingService.stopPing();
  });
}

export default supabasePingService;
