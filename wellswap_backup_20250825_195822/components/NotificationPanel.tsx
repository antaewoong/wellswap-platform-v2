// components/NotificationPanel.tsx - 실시간 알림 패널
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  realtimeNotificationService, 
  TradeNotification, 
  MarketAlert 
} from '../lib/realtime-notifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<TradeNotification[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'alerts'>('notifications');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 초기 알림 로드
    setNotifications(realtimeNotificationService.getNotifications());
    setMarketAlerts(realtimeNotificationService.getMarketAlerts());
    setUnreadCount(realtimeNotificationService.getUnreadCount());

    // 실시간 구독
    const unsubscribeNotifications = realtimeNotificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 19)]);
      setUnreadCount(realtimeNotificationService.getUnreadCount());
    });

    const unsubscribeAlerts = realtimeNotificationService.subscribeToAlerts((alert) => {
      setMarketAlerts(prev => [alert, ...prev.slice(0, 9)]);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeAlerts();
    };
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    realtimeNotificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(realtimeNotificationService.getUnreadCount());
  };

  const handleMarkAllAsRead = () => {
    realtimeNotificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDeleteNotification = (notificationId: string) => {
    realtimeNotificationService.deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(realtimeNotificationService.getUnreadCount());
  };

  const handleDeleteAlert = (alertId: string) => {
    realtimeNotificationService.deleteMarketAlert(alertId);
    setMarketAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-lg font-semibold text-gray-800">알림 센터</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              거래 알림
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'alerts'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              시장 알림
            </button>
          </div>

          {/* 알림 목록 */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'notifications' ? (
              <div className="p-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p>새로운 알림이 없습니다</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-gray-700">최근 알림</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          모두 읽음 처리
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border transition-all ${
                            notification.read 
                              ? 'bg-gray-50 border-gray-200' 
                              : 'bg-white border-blue-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority === 'high' ? '🔴' : 
                                   notification.priority === 'medium' ? '🟡' : '🟢'}
                                  {notification.priority.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.data.timestamp)}
                                </span>
                              </div>
                              <h4 className={`text-sm font-medium mb-1 ${
                                notification.read ? 'text-gray-600' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {notification.message}
                              </p>
                              {notification.data.price && (
                                <div className="mt-2 text-xs text-gray-500">
                                  가격: {notification.data.price.toLocaleString()}원
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  읽음
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="p-1 text-xs text-red-600 hover:bg-red-50 rounded"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4">
                {marketAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>시장 알림이 없습니다</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">시장 알림</h3>
                    <div className="space-y-3">
                      {marketAlerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">
                                  {alert.severity === 'critical' ? '🚨' : 
                                   alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                                  {alert.severity.toUpperCase()}
                                </span>
                                <span className="text-xs opacity-75">
                                  {formatTime(alert.timestamp)}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium mb-1">
                                {alert.title}
                              </h4>
                              <p className="text-sm leading-relaxed">
                                {alert.message}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="p-1 text-xs opacity-75 hover:opacity-100 rounded ml-2"
                            >
                              삭제
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;

