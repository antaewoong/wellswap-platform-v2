// lib/performance.ts - 성능 모니터링 시스템

// 성능 측정 함수
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const start = performance.now();
  
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
      });
    } else {
      const end = performance.now();
      console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
      return result;
    }
  } catch (error) {
    const end = performance.now();
    console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
};

// 메모리 사용량 모니터링
export const monitorMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log('🧠 Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  }
};

// 네트워크 성능 모니터링
export const monitorNetworkPerformance = () => {
  if (typeof window !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      console.log('🌐 Network Info:', {
        effectiveType: connection.effectiveType,
        downlink: `${connection.downlink} Mbps`,
        rtt: `${connection.rtt}ms`
      });
    }
  }
};

// 페이지 로드 성능 모니터링
export const monitorPageLoadPerformance = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        console.log('📊 Page Load Performance:', {
          domContentLoaded: `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`,
          loadComplete: `${navigation.loadEventEnd - navigation.loadEventStart}ms`,
          totalLoadTime: `${navigation.loadEventEnd - navigation.fetchStart}ms`
        });
      }, 0);
    });
  }
};

// API 응답 시간 모니터링
export const monitorAPIResponse = async (apiCall: () => Promise<any>, name: string) => {
  const start = performance.now();
  try {
    const result = await apiCall();
    const end = performance.now();
    console.log(`🌐 API ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`❌ API ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
};

// 실시간 성능 알림 시스템
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private alerts: Map<string, number> = new Map();
  private thresholds = {
    memory: 100, // MB
    apiResponse: 3000, // ms
    pageLoad: 5000 // ms
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 성능 알림
  alert(metric: string, value: number, threshold: number) {
    const key = `${metric}_${Date.now()}`;
    if (!this.alerts.has(key)) {
      console.warn(`⚠️ Performance Alert: ${metric} = ${value} (threshold: ${threshold})`);
      this.alerts.set(key, Date.now());
      
      // 5분 후 알림 제거
      setTimeout(() => {
        this.alerts.delete(key);
      }, 5 * 60 * 1000);
    }
  }

  // 메모리 사용량 체크
  checkMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1048576;
      
      if (usedMB > this.thresholds.memory) {
        this.alert('Memory Usage', usedMB, this.thresholds.memory);
      }
    }
  }

  // API 응답 시간 체크
  checkAPIResponseTime(responseTime: number, apiName: string) {
    if (responseTime > this.thresholds.apiResponse) {
      this.alert(`API Response (${apiName})`, responseTime, this.thresholds.apiResponse);
    }
  }

  // 페이지 로드 시간 체크
  checkPageLoadTime(loadTime: number) {
    if (loadTime > this.thresholds.pageLoad) {
      this.alert('Page Load Time', loadTime, this.thresholds.pageLoad);
    }
  }
}

// 성능 모니터링 시작
export const startPerformanceMonitoring = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  // 주기적 메모리 체크
  setInterval(() => {
    monitor.checkMemoryUsage();
  }, 30000); // 30초마다
  
  // 페이지 로드 성능 체크
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        monitor.checkPageLoadTime(loadTime);
      }, 0);
    });
  }
};
