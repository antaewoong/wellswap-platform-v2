// Enhanced Real-time Notification System
// 고도화된 실시간 알림 시스템 - WebSocket 연결 및 고급 알림 기능

interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'trade' | 'valuation' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'trade' | 'valuation' | 'system' | 'security' | 'performance';
  data?: any;
  actions?: NotificationAction[];
  expiresAt?: Date;
  read: boolean;
}

interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'dismiss';
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  timeout: number;
}

interface NotificationPreferences {
  enabled: boolean;
  categories: {
    trade: boolean;
    valuation: boolean;
    system: boolean;
    security: boolean;
    performance: boolean;
  };
  priority: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
  sound: boolean;
  desktop: boolean;
  email: boolean;
  push: boolean;
}

export class EnhancedNotificationSystem {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private notifications: NotificationMessage[] = [];
  private listeners: Set<(notifications: NotificationMessage[]) => void> = new Set();
  private config: WebSocketConfig;
  private preferences: NotificationPreferences;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      url: 'wss://wellswaphk.onrender.com/ws/notifications',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      timeout: 10000,
      ...config
    };

    this.preferences = {
      enabled: true,
      categories: {
        trade: true,
        valuation: true,
        system: true,
        security: true,
        performance: true
      },
      priority: {
        low: true,
        medium: true,
        high: true,
        critical: true
      },
      sound: true,
      desktop: true,
      email: false,
      push: false
    };

    this.initializeSystem();
  }

  // 시스템 초기화
  private async initializeSystem(): Promise<void> {
    console.log('🔔 고도화된 알림 시스템 초기화 시작');

    // 브라우저 알림 권한 요청
    await this.requestNotificationPermission();

    // WebSocket 연결
    await this.connect();

    // 로컬 스토리지에서 알림 로드
    this.loadNotificationsFromStorage();

    // 알림 정리 (만료된 알림 제거)
    this.cleanupExpiredNotifications();

    console.log('✅ 고도화된 알림 시스템 초기화 완료');
  }

  // WebSocket 연결
  private async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);
        
        // 연결 타임아웃 설정
        const timeout = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, this.config.timeout);

        this.ws.onopen = () => {
          console.log('🔗 WebSocket 연결 성공');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          clearTimeout(timeout);
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleWebSocketMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket 연결 종료:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket 오류:', error);
          clearTimeout(timeout);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // WebSocket 메시지 처리
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'notification':
          this.handleNotificationMessage(data.payload);
          break;
        case 'trade_update':
          this.handleTradeUpdate(data.payload);
          break;
        case 'valuation_update':
          this.handleValuationUpdate(data.payload);
          break;
        case 'system_alert':
          this.handleSystemAlert(data.payload);
          break;
        case 'heartbeat':
          this.handleHeartbeat();
          break;
        default:
          console.warn('알 수 없는 메시지 타입:', data.type);
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  }

  // 알림 메시지 처리
  private handleNotificationMessage(payload: any): void {
    const notification: NotificationMessage = {
      id: payload.id || this.generateId(),
      type: payload.type || 'info',
      title: payload.title || '알림',
      message: payload.message || '',
      timestamp: new Date(payload.timestamp || Date.now()),
      priority: payload.priority || 'medium',
      category: payload.category || 'system',
      data: payload.data,
      actions: payload.actions?.map((action: any) => ({
        id: action.id,
        label: action.label,
        type: action.type || 'button',
        action: () => this.executeAction(action.action),
        style: action.style || 'primary'
      })),
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
      read: false
    };

    this.addNotification(notification);
  }

  // 거래 업데이트 처리
  private handleTradeUpdate(payload: any): void {
    const notification: NotificationMessage = {
      id: this.generateId(),
      type: 'trade',
      title: '거래 업데이트',
      message: `거래 ID ${payload.tradeId}의 상태가 ${payload.status}로 변경되었습니다.`,
      timestamp: new Date(),
      priority: 'high',
      category: 'trade',
      data: payload,
      actions: [
        {
          id: 'view_trade',
          label: '거래 보기',
          type: 'button',
          action: () => this.viewTrade(payload.tradeId),
          style: 'primary'
        },
        {
          id: 'dismiss',
          label: '닫기',
          type: 'dismiss',
          action: () => this.dismissNotification(this.generateId()),
          style: 'secondary'
        }
      ],
      read: false
    };

    this.addNotification(notification);
  }

  // 평가 업데이트 처리
  private handleValuationUpdate(payload: any): void {
    const notification: NotificationMessage = {
      id: this.generateId(),
      type: 'valuation',
      title: 'AI 평가 완료',
      message: `보험 자산 평가가 완료되었습니다. 예상 가치: $${payload.estimatedValue?.toLocaleString()}`,
      timestamp: new Date(),
      priority: 'medium',
      category: 'valuation',
      data: payload,
      actions: [
        {
          id: 'view_details',
          label: '상세 보기',
          type: 'button',
          action: () => this.viewValuationDetails(payload.valuationId),
          style: 'primary'
        }
      ],
      read: false
    };

    this.addNotification(notification);
  }

  // 시스템 알림 처리
  private handleSystemAlert(payload: any): void {
    const notification: NotificationMessage = {
      id: this.generateId(),
      type: 'system',
      title: '시스템 알림',
      message: payload.message || '시스템 상태가 변경되었습니다.',
      timestamp: new Date(),
      priority: payload.priority || 'medium',
      category: 'system',
      data: payload,
      read: false
    };

    this.addNotification(notification);
  }

  // 하트비트 처리
  private handleHeartbeat(): void {
    // 연결 상태 확인 및 응답
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'heartbeat_response' }));
    }
  }

  // 알림 추가
  public addNotification(notification: NotificationMessage): void {
    // 알림 설정 확인
    if (!this.shouldShowNotification(notification)) {
      return;
    }

    // 알림 목록에 추가
    this.notifications.unshift(notification);

    // 최대 알림 수 제한 (100개)
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // 로컬 스토리지에 저장
    this.saveNotificationsToStorage();

    // 리스너들에게 알림
    this.notifyListeners();

    // 브라우저 알림 표시
    this.showBrowserNotification(notification);

    // 소리 재생
    if (this.preferences.sound) {
      this.playNotificationSound(notification.priority);
    }

    console.log('🔔 새 알림 추가:', notification.title);
  }

  // 알림 표시 여부 확인
  private shouldShowNotification(notification: NotificationMessage): boolean {
    if (!this.preferences.enabled) return false;
    if (!this.preferences.categories[notification.category]) return false;
    if (!this.preferences.priority[notification.priority]) return false;
    return true;
  }

  // 브라우저 알림 표시
  private async showBrowserNotification(notification: NotificationMessage): Promise<void> {
    if (!this.preferences.desktop || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
        actions: notification.actions?.map(action => ({
          action: action.id,
          title: action.label
        })) || []
      });

      browserNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
      };

      // 자동 닫기 (중요하지 않은 알림)
      if (notification.priority !== 'critical') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  // 알림 소리 재생
  private playNotificationSound(priority: string): void {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 우선순위에 따른 소리 설정
    const frequency = priority === 'critical' ? 800 : priority === 'high' ? 600 : 400;
    const duration = priority === 'critical' ? 0.3 : 0.2;

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  // 알림 권한 요청
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('알림 권한:', permission);
    }
  }

  // 알림 읽음 처리
  public markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotificationsToStorage();
      this.notifyListeners();
    }
  }

  // 알림 삭제
  public dismissNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotificationsToStorage();
    this.notifyListeners();
  }

  // 모든 알림 읽음 처리
  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotificationsToStorage();
    this.notifyListeners();
  }

  // 모든 알림 삭제
  public clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotificationsToStorage();
    this.notifyListeners();
  }

  // 알림 필터링
  public getNotifications(filters?: {
    type?: string;
    category?: string;
    priority?: string;
    read?: boolean;
  }): NotificationMessage[] {
    let filtered = [...this.notifications];

    if (filters?.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }
    if (filters?.category) {
      filtered = filtered.filter(n => n.category === filters.category);
    }
    if (filters?.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }
    if (filters?.read !== undefined) {
      filtered = filtered.filter(n => n.read === filters.read);
    }

    return filtered;
  }

  // 읽지 않은 알림 수
  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // 알림 설정 업데이트
  public updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
  }

  // 알림 리스너 등록
  public addListener(callback: (notifications: NotificationMessage[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 리스너들에게 알림
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback([...this.notifications]);
      } catch (error) {
        console.error('알림 리스너 오류:', error);
      }
    });
  }

  // 하트비트 시작
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, this.config.heartbeatInterval);
  }

  // 하트비트 중지
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 재연결 스케줄링
  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`재연결 시도 ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(error => {
          console.error('재연결 실패:', error);
        });
      }, this.config.reconnectInterval);
    } else {
      console.error('최대 재연결 시도 횟수 초과');
    }
  }

  // 만료된 알림 정리
  private cleanupExpiredNotifications(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(notification => {
      if (notification.expiresAt && notification.expiresAt < now) {
        return false;
      }
      return true;
    });
    this.saveNotificationsToStorage();
  }

  // 로컬 스토리지에서 알림 로드
  private loadNotificationsFromStorage(): void {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
        }));
      }
    } catch (error) {
      console.error('알림 로드 오류:', error);
    }
  }

  // 로컬 스토리지에 알림 저장
  private saveNotificationsToStorage(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('알림 저장 오류:', error);
    }
  }

  // 액션 실행
  private executeAction(action: string): void {
    console.log('액션 실행:', action);
    // 액션별 처리 로직
  }

  // 거래 보기
  private viewTrade(tradeId: string): void {
    console.log('거래 보기:', tradeId);
    // 거래 상세 페이지로 이동
  }

  // 평가 상세 보기
  private viewValuationDetails(valuationId: string): void {
    console.log('평가 상세 보기:', valuationId);
    // 평가 상세 페이지로 이동
  }

  // ID 생성
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 연결 상태 확인
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  // 연결 종료
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    this.isConnected = false;
  }
}

// 전역 알림 시스템 인스턴스
let enhancedNotificationSystem: EnhancedNotificationSystem | null = null;

export const initializeEnhancedNotifications = (config?: Partial<WebSocketConfig>): EnhancedNotificationSystem => {
  if (!enhancedNotificationSystem) {
    enhancedNotificationSystem = new EnhancedNotificationSystem(config);
  }
  return enhancedNotificationSystem;
};

export const getEnhancedNotificationSystem = (): EnhancedNotificationSystem | null => {
  return enhancedNotificationSystem;
};

export default EnhancedNotificationSystem;
