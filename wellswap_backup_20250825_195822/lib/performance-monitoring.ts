// Advanced Performance Monitoring System
// Real-time performance tracking with analytics and alerting

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  networkLatency: number;
  errorRate: number;
  userInteractions: number;
  sessionDuration: number;
}

interface AlertThresholds {
  pageLoadTime: number;
  memoryUsage: number;
  errorRate: number;
  networkLatency: number;
}

class AdvancedPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: AlertThresholds;
  private isMonitoring: boolean = false;
  private sessionStartTime: number;
  private userInteractions: number = 0;

  constructor(thresholds?: Partial<AlertThresholds>) {
    this.thresholds = {
      pageLoadTime: 3000, // 3 seconds
      memoryUsage: 50 * 1024 * 1024, // 50MB
      errorRate: 0.05, // 5%
      networkLatency: 1000, // 1 second
      ...thresholds
    };
    this.sessionStartTime = Date.now();
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // User interaction tracking
    ['click', 'scroll', 'input', 'submit'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.userInteractions++;
      }, { passive: true });
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason);
    });
  }

  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorPageLoad();
    this.monitorMemoryUsage();
    this.monitorNetworkPerformance();
    this.monitorUserInteractions();
    
    console.log('🚀 Advanced Performance Monitoring Started');
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('⏹️ Performance Monitoring Stopped');
  }

  private async monitorPageLoad(): Promise<void> {
    if (!this.isMonitoring) return;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics: Partial<PerformanceMetrics> = {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: await this.getLargestContentfulPaint(),
        cumulativeLayoutShift: await this.getCumulativeLayoutShift(),
        firstInputDelay: await this.getFirstInputDelay()
      };

      this.addMetrics(metrics);
      this.checkThresholds(metrics);
    } catch (error) {
      console.error('Page load monitoring error:', error);
    }

    // Continue monitoring
    setTimeout(() => this.monitorPageLoad(), 5000);
  }

  private async getLargestContentfulPaint(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(0);
      }
    });
  }

  private async getCumulativeLayoutShift(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        let cls = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += (entry as any).value;
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        setTimeout(() => resolve(cls), 1000);
      } else {
        resolve(0);
      }
    });
  }

  private async getFirstInputDelay(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            resolve((entry as any).processingStart - entry.startTime);
            break;
          }
        });
        observer.observe({ entryTypes: ['first-input'] });
      } else {
        resolve(0);
      }
    });
  }

  private monitorMemoryUsage(): void {
    if (!this.isMonitoring) return;

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const metrics: Partial<PerformanceMetrics> = {
        memoryUsage: memory.usedJSHeapSize
      };

      this.addMetrics(metrics);
      this.checkThresholds(metrics);
    }

    setTimeout(() => this.monitorMemoryUsage(), 10000);
  }

  private async monitorNetworkPerformance(): Promise<void> {
    if (!this.isMonitoring) return;

    try {
      const startTime = performance.now();
      const response = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const endTime = performance.now();
      
      const metrics: Partial<PerformanceMetrics> = {
        networkLatency: endTime - startTime
      };

      this.addMetrics(metrics);
      this.checkThresholds(metrics);
    } catch (error) {
      console.error('Network monitoring error:', error);
    }

    setTimeout(() => this.monitorNetworkPerformance(), 15000);
  }

  private monitorUserInteractions(): void {
    if (!this.isMonitoring) return;

    const metrics: Partial<PerformanceMetrics> = {
      userInteractions: this.userInteractions,
      sessionDuration: Date.now() - this.sessionStartTime
    };

    this.addMetrics(metrics);
    setTimeout(() => this.monitorUserInteractions(), 30000);
  }

  private trackError(error: Error): void {
    const metrics: Partial<PerformanceMetrics> = {
      errorRate: this.calculateErrorRate()
    };

    this.addMetrics(metrics);
    this.checkThresholds(metrics);
    
    // Send error to analytics
    this.sendErrorToAnalytics(error);
  }

  private calculateErrorRate(): number {
    const recentMetrics = this.metrics.slice(-10);
    const errorCount = recentMetrics.filter(m => m.errorRate > 0).length;
    return errorCount / recentMetrics.length;
  }

  private addMetrics(newMetrics: Partial<PerformanceMetrics>): void {
    const timestamp = Date.now();
    const metric: PerformanceMetrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      memoryUsage: 0,
      networkLatency: 0,
      errorRate: 0,
      userInteractions: 0,
      sessionDuration: 0,
      ...newMetrics
    };

    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  private checkThresholds(metrics: Partial<PerformanceMetrics>): void {
    const alerts: string[] = [];

    if (metrics.pageLoadTime && metrics.pageLoadTime > this.thresholds.pageLoadTime) {
      alerts.push(`Page load time (${metrics.pageLoadTime}ms) exceeds threshold (${this.thresholds.pageLoadTime}ms)`);
    }

    if (metrics.memoryUsage && metrics.memoryUsage > this.thresholds.memoryUsage) {
      alerts.push(`Memory usage (${Math.round(metrics.memoryUsage / 1024 / 1024)}MB) exceeds threshold (${Math.round(this.thresholds.memoryUsage / 1024 / 1024)}MB)`);
    }

    if (metrics.errorRate && metrics.errorRate > this.thresholds.errorRate) {
      alerts.push(`Error rate (${(metrics.errorRate * 100).toFixed(1)}%) exceeds threshold (${(this.thresholds.errorRate * 100).toFixed(1)}%)`);
    }

    if (metrics.networkLatency && metrics.networkLatency > this.thresholds.networkLatency) {
      alerts.push(`Network latency (${metrics.networkLatency}ms) exceeds threshold (${this.thresholds.networkLatency}ms)`);
    }

    if (alerts.length > 0) {
      this.sendAlerts(alerts);
    }
  }

  private sendAlerts(alerts: string[]): void {
    console.warn('🚨 Performance Alerts:', alerts);
    
    // Send to analytics or notification system
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_alert', {
        alerts: alerts.join(', ')
      });
    }
  }

  private sendErrorToAnalytics(error: Error): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const sum = this.metrics.reduce((acc, metric) => {
      Object.keys(metric).forEach(key => {
        if (typeof metric[key as keyof PerformanceMetrics] === 'number') {
          acc[key] = (acc[key] || 0) + metric[key as keyof PerformanceMetrics];
        }
      });
      return acc;
    }, {} as any);

    const avg: Partial<PerformanceMetrics> = {};
    Object.keys(sum).forEach(key => {
      avg[key as keyof PerformanceMetrics] = sum[key] / this.metrics.length;
    });

    return avg;
  }

  public generateReport(): string {
    const avgMetrics = this.getAverageMetrics();
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    return `
📊 Performance Report
====================
Session Duration: ${Math.round(sessionDuration / 1000)}s
User Interactions: ${this.userInteractions}
Total Metrics Collected: ${this.metrics.length}

Average Metrics:
- Page Load Time: ${avgMetrics.pageLoadTime?.toFixed(2)}ms
- Memory Usage: ${avgMetrics.memoryUsage ? Math.round(avgMetrics.memoryUsage / 1024 / 1024) : 0}MB
- Network Latency: ${avgMetrics.networkLatency?.toFixed(2)}ms
- Error Rate: ${avgMetrics.errorRate ? (avgMetrics.errorRate * 100).toFixed(2) : 0}%

Thresholds:
- Page Load Time: ${this.thresholds.pageLoadTime}ms
- Memory Usage: ${Math.round(this.thresholds.memoryUsage / 1024 / 1024)}MB
- Error Rate: ${(this.thresholds.errorRate * 100).toFixed(1)}%
- Network Latency: ${this.thresholds.networkLatency}ms
    `.trim();
  }
}

// Global instance
let performanceMonitor: AdvancedPerformanceMonitor | null = null;

export const initializePerformanceMonitoring = (thresholds?: Partial<AlertThresholds>): AdvancedPerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new AdvancedPerformanceMonitor(thresholds);
    performanceMonitor.startMonitoring();
  }
  return performanceMonitor;
};

export const getPerformanceMonitor = (): AdvancedPerformanceMonitor | null => {
  return performanceMonitor;
};

export const stopPerformanceMonitoring = (): void => {
  if (performanceMonitor) {
    performanceMonitor.stopMonitoring();
    performanceMonitor = null;
  }
};

export default AdvancedPerformanceMonitor;
