// lib/realtime-notifications.ts - 실시간 거래 알림 시스템
import { supabase } from './database-wellswap';

export interface TradeNotification {
  id: string;
  type: 'trade_created' | 'trade_completed' | 'price_update' | 'market_alert';
  title: string;
  message: string;
  data: {
    tradeId?: string;
    assetId?: string;
    price?: number;
    buyer?: string;
    seller?: string;
    timestamp: string;
  };
  priority: 'low' | 'medium' | 'high';
  read: boolean;
}

export interface MarketAlert {
  id: string;
  type: 'volume_spike' | 'price_movement' | 'liquidity_change';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

class RealtimeNotificationService {
  private notifications: TradeNotification[] = [];
  private marketAlerts: MarketAlert[] = [];
  private subscribers: Set<(notification: TradeNotification) => void> = new Set();
  private alertSubscribers: Set<(alert: MarketAlert) => void> = new Set();

  constructor() {
    this.initializeRealtimeSubscriptions();
  }

  // 실시간 구독 초기화
  private initializeRealtimeSubscriptions() {
    try {
      console.log('🔔 실시간 알림 시스템 초기화 완료 (기본 모드)');
    } catch (error) {
      console.warn('⚠️ 실시간 구독 초기화 실패:', error);
      console.log('🔔 실시간 알림 시스템이 기본 모드로 실행됩니다');
    }
  }

  // 거래 변경 처리
  private handleTradeChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        this.createTradeNotification({
          type: 'trade_created',
          title: '새로운 거래 등록',
          message: `${newRecord.company_name} 보험 상품이 등록되었습니다.`,
          data: {
            assetId: newRecord.id,
            price: newRecord.asking_price,
            timestamp: new Date().toISOString()
          },
          priority: 'medium'
        });
        break;

      case 'UPDATE':
        if (newRecord.status !== oldRecord.status) {
          this.createTradeNotification({
            type: 'trade_completed',
            title: '거래 완료',
            message: `${newRecord.company_name} 보험 상품 거래가 완료되었습니다.`,
            data: {
              assetId: newRecord.id,
              price: newRecord.asking_price,
              timestamp: new Date().toISOString()
            },
            priority: 'high'
          });
        }
        break;
    }
  }

  // 시장 변경 처리
  private handleMarketChange(payload: any) {
    const { eventType, new: newRecord } = payload;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      // 거래량 급증 알림
      if (newRecord.volume_change > 50) {
        this.createMarketAlert({
          type: 'volume_spike',
          title: '거래량 급증',
          message: `거래량이 ${newRecord.volume_change}% 증가했습니다.`,
          severity: 'warning'
        });
      }

      // 가격 변동 알림
      if (Math.abs(newRecord.price_change) > 10) {
        this.createMarketAlert({
          type: 'price_movement',
          title: '가격 변동',
          message: `평균 가격이 ${newRecord.price_change > 0 ? '+' : ''}${newRecord.price_change}% 변동했습니다.`,
          severity: newRecord.price_change > 20 ? 'critical' : 'info'
        });
      }
    }
  }

  // 거래 알림 생성
  private createTradeNotification(notification: Omit<TradeNotification, 'id' | 'read'>) {
    const newNotification: TradeNotification = {
      ...notification,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false
    };

    this.notifications.unshift(newNotification);
    
    // 최대 100개 알림 유지
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // 구독자들에게 알림
    this.subscribers.forEach(callback => callback(newNotification));

    // 브라우저 알림 (사용자 허용 시)
    this.showBrowserNotification(newNotification);

    console.log('🔔 거래 알림 생성:', newNotification.title);
  }

  // 시장 알림 생성
  private createMarketAlert(alert: Omit<MarketAlert, 'id' | 'timestamp'>) {
    const newAlert: MarketAlert = {
      ...alert,
      id: `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.marketAlerts.unshift(newAlert);
    
    // 최대 50개 알림 유지
    if (this.marketAlerts.length > 50) {
      this.marketAlerts = this.marketAlerts.slice(0, 50);
    }

    // 구독자들에게 알림
    this.alertSubscribers.forEach(callback => callback(newAlert));

    console.log('🚨 시장 알림 생성:', newAlert.title);
  }

  // 브라우저 알림 표시
  private showBrowserNotification(notification: TradeNotification) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.showBrowserNotification(notification);
          }
        });
      }
    }
  }

  // 알림 구독
  subscribe(callback: (notification: TradeNotification) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // 시장 알림 구독
  subscribeToAlerts(callback: (alert: MarketAlert) => void) {
    this.alertSubscribers.add(callback);
    return () => this.alertSubscribers.delete(callback);
  }

  // 알림 읽음 처리
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // 모든 알림 읽음 처리
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  // 알림 목록 조회
  getNotifications(limit: number = 20): TradeNotification[] {
    return this.notifications.slice(0, limit);
  }

  // 읽지 않은 알림 수
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // 시장 알림 목록 조회
  getMarketAlerts(limit: number = 10): MarketAlert[] {
    return this.marketAlerts.slice(0, limit);
  }

  // 알림 삭제
  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  // 시장 알림 삭제
  deleteMarketAlert(alertId: string) {
    this.marketAlerts = this.marketAlerts.filter(a => a.id !== alertId);
  }
}

// 싱글톤 인스턴스
export const realtimeNotificationService = new RealtimeNotificationService();
