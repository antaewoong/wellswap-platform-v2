// 🤖 Telegram Bot Monitoring System - 100% Free Solution

interface TelegramConfig {
  botToken: string;
  chatId: string;
  adminChatIds?: string[];
}

interface MonitoringAlert {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  data?: any;
  timestamp?: number;
}

interface SystemStatus {
  database: boolean;
  blockchain: boolean;
  api: boolean;
  memory: number;
  uptime: number;
}

export class TelegramMonitoring {
  private config: TelegramConfig;
  private baseUrl: string;
  
  constructor(config: TelegramConfig) {
    this.config = config;
    this.baseUrl = `https://api.telegram.org/bot${config.botToken}`;
  }

  // Send alert to Telegram
  async sendAlert(alert: MonitoringAlert): Promise<boolean> {
    const message = this.formatMessage(alert);
    
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.config.chatId,
          text: message,
          parse_mode: 'HTML',
          disable_notification: alert.type === 'info'
        }),
      });

      const result = await response.json();
      
      if (!result.ok) {
        console.error('❌ Telegram alert failed:', result);
        return false;
      }

      console.log('✅ Telegram alert sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send Telegram alert:', error);
      return false;
    }
  }

  // Send alerts to multiple admins
  async sendAdminAlert(alert: MonitoringAlert): Promise<boolean> {
    const chatIds = this.config.adminChatIds || [this.config.chatId];
    const promises = chatIds.map(chatId => 
      this.sendAlertToChat(alert, chatId)
    );

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    return successCount > 0;
  }

  private async sendAlertToChat(alert: MonitoringAlert, chatId: string): Promise<boolean> {
    const message = this.formatMessage(alert);
    
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      return (await response.json()).ok;
    } catch {
      return false;
    }
  }

  // Format alert message with emojis and HTML
  private formatMessage(alert: MonitoringAlert): string {
    const timestamp = new Date(alert.timestamp || Date.now()).toLocaleString();
    const emoji = this.getAlertEmoji(alert.type);
    
    let message = `${emoji} <b>WellSwap Alert</b>\n\n`;
    message += `<b>Type:</b> ${alert.type.toUpperCase()}\n`;
    message += `<b>Time:</b> ${timestamp}\n`;
    message += `<b>Message:</b> ${alert.message}\n`;
    
    if (alert.data) {
      message += `\n<b>Details:</b>\n`;
      message += `<code>${JSON.stringify(alert.data, null, 2)}</code>`;
    }
    
    return message;
  }

  private getAlertEmoji(type: string): string {
    const emojis = {
      error: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    return emojis[type] || '📢';
  }
}

// Server Health Monitor
export class HealthMonitor {
  private telegram: TelegramMonitoring;
  private lastStatus: SystemStatus | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(telegram: TelegramMonitoring) {
    this.telegram = telegram;
  }

  // Start health monitoring
  startMonitoring(intervalMinutes = 5): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log(`🔍 Starting health monitoring (every ${intervalMinutes} minutes)`);
    
    // Initial check
    this.checkHealth();
    
    // Periodic checks
    this.monitoringInterval = setInterval(() => {
      this.checkHealth();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ Health monitoring stopped');
    }
  }

  // Check system health
  private async checkHealth(): Promise<void> {
    try {
      const status = await this.getSystemStatus();
      
      // Compare with last status and send alerts if needed
      if (this.lastStatus) {
        await this.compareStatus(this.lastStatus, status);
      }
      
      this.lastStatus = status;
      
      // Send daily health report (at 9 AM)
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() < 5) {
        await this.sendHealthReport(status);
      }
      
    } catch (error) {
      await this.telegram.sendAlert({
        type: 'error',
        message: 'Health monitoring system failure',
        data: { error: String(error) }
      });
    }
  }

  // Get current system status
  private async getSystemStatus(): Promise<SystemStatus> {
    const status: SystemStatus = {
      database: false,
      blockchain: false,
      api: false,
      memory: 0,
      uptime: process.uptime()
    };

    // Check database connection
    try {
      const response = await fetch('/api/health/database', { 
        method: 'GET',
        cache: 'no-cache'
      });
      status.database = response.ok;
    } catch {
      status.database = false;
    }

    // Check blockchain connection
    try {
      const response = await fetch('/api/health/blockchain', {
        method: 'GET',
        cache: 'no-cache'
      });
      status.blockchain = response.ok;
    } catch {
      status.blockchain = false;
    }

    // Check API health
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache'
      });
      status.api = response.ok;
    } catch {
      status.api = false;
    }

    // Get memory usage (Node.js only)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      status.memory = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    }

    return status;
  }

  // Compare statuses and send alerts
  private async compareStatus(oldStatus: SystemStatus, newStatus: SystemStatus): Promise<void> {
    // Database status change
    if (oldStatus.database !== newStatus.database) {
      await this.telegram.sendAlert({
        type: newStatus.database ? 'success' : 'error',
        message: `Database ${newStatus.database ? 'connected' : 'disconnected'}`,
      });
    }

    // Blockchain status change
    if (oldStatus.blockchain !== newStatus.blockchain) {
      await this.telegram.sendAlert({
        type: newStatus.blockchain ? 'success' : 'error',
        message: `Blockchain ${newStatus.blockchain ? 'connected' : 'disconnected'}`,
      });
    }

    // API status change
    if (oldStatus.api !== newStatus.api) {
      await this.telegram.sendAlert({
        type: newStatus.api ? 'success' : 'error',
        message: `API ${newStatus.api ? 'healthy' : 'unhealthy'}`,
      });
    }

    // High memory usage alert (>500MB)
    if (newStatus.memory > 500 && oldStatus.memory <= 500) {
      await this.telegram.sendAlert({
        type: 'warning',
        message: `High memory usage: ${newStatus.memory}MB`,
      });
    }

    // Server restart detected
    if (newStatus.uptime < oldStatus.uptime) {
      await this.telegram.sendAlert({
        type: 'info',
        message: 'Server restarted',
        data: { uptime: `${Math.round(newStatus.uptime / 60)} minutes` }
      });
    }
  }

  // Send daily health report
  private async sendHealthReport(status: SystemStatus): Promise<void> {
    const uptimeHours = Math.round(status.uptime / 3600);
    
    await this.telegram.sendAlert({
      type: 'info',
      message: '🌅 Daily Health Report',
      data: {
        database: status.database ? '✅ Connected' : '❌ Disconnected',
        blockchain: status.blockchain ? '✅ Connected' : '❌ Disconnected',
        api: status.api ? '✅ Healthy' : '❌ Unhealthy',
        memory: `${status.memory}MB`,
        uptime: `${uptimeHours} hours`
      }
    });
  }
}

// Application-specific monitoring
export class WellSwapMonitoring {
  private telegram: TelegramMonitoring;

  constructor(telegram: TelegramMonitoring) {
    this.telegram = telegram;
  }

  // Monitor user actions
  async logUserAction(action: string, userId: string, data?: any): Promise<void> {
    // Only log important actions
    const importantActions = [
      'wallet_connected',
      'insurance_listed',
      'trade_initiated', 
      'trade_completed',
      'withdrawal_requested'
    ];

    if (importantActions.includes(action)) {
      await this.telegram.sendAlert({
        type: 'info',
        message: `User Action: ${action}`,
        data: { userId, ...data }
      });
    }
  }

  // Monitor errors
  async logError(error: Error, context?: string): Promise<void> {
    await this.telegram.sendAlert({
      type: 'error',
      message: `Application Error: ${error.message}`,
      data: {
        context,
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      }
    });
  }

  // Monitor blockchain transactions
  async logTransaction(type: 'success' | 'failed', txHash: string, data?: any): Promise<void> {
    await this.telegram.sendAlert({
      type: type === 'success' ? 'success' : 'error',
      message: `Blockchain Transaction ${type}`,
      data: { txHash, ...data }
    });
  }

  // Monitor business metrics
  async logBusinessMetric(metric: string, value: number, unit?: string): Promise<void> {
    await this.telegram.sendAlert({
      type: 'info',
      message: `📊 Business Metric: ${metric}`,
      data: { value: `${value}${unit || ''}` }
    });
  }
}

// Initialize monitoring system
export function initializeMonitoring(config: TelegramConfig) {
  const telegram = new TelegramMonitoring(config);
  const healthMonitor = new HealthMonitor(telegram);
  const appMonitor = new WellSwapMonitoring(telegram);

  // Start health monitoring
  healthMonitor.startMonitoring(5); // Check every 5 minutes

  // Send startup notification
  telegram.sendAlert({
    type: 'success',
    message: '🚀 WellSwap monitoring system started'
  });

  return {
    telegram,
    healthMonitor,
    appMonitor
  };
}

export default TelegramMonitoring;