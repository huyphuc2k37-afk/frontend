/**
 * Performance Monitoring & Metrics
 * 
 * Provides utilities for tracking and monitoring performance metrics.
 */

export interface PerformanceMetrics {
  ttfb: number;       // Time to First Byte
  fcp: number;        // First Contentful Paint
  lcp: number;        // Largest Contentful Paint
  fid: number;        // First Input Delay
  cls: number;         // Cumulative Layout Shift
  loadTime: number;    // Page load time
}

export interface ApiMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
}

/**
 * Record performance metrics from the browser
 */
export function recordPerformanceMetrics(): PerformanceMetrics | null {
  if (typeof window === "undefined" || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType("paint");

  const fcp = paint.find((e) => e.name === "first-contentful-paint")?.startTime || 0;
  const lcp = paint.reduce((max, entry) => {
    if (entry.entryType === "largest-contentful-paint") {
      return Math.max(max, entry.startTime);
    }
    return max;
  }, 0);

  return {
    ttfb: navigation.responseStart || 0,
    fcp,
    lcp,
    fid: 0, // FID would need InteractionObserver
    cls: 0, // CLS would need LayoutObserver
    loadTime: navigation.loadEventEnd || 0,
  };
}

/**
 * Send metrics to backend
 */
export async function sendMetrics(metrics: PerformanceMetrics, endpoint?: string): Promise<void> {
  try {
    const data = {
      ...metrics,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      endpoint: endpoint || "",
      timestamp: new Date().toISOString(),
    };

    // Don't block the page load
    navigator.sendBeacon?.(
      "/api/metrics/performance",
      JSON.stringify(data)
    );
  } catch {
    // Silently fail - metrics are not critical
  }
}

/**
 * Track Core Web Vitals with PerformanceObserver
 */
export function initPerformanceObserver(): void {
  if (typeof window === "undefined" || !window.PerformanceObserver) {
    return;
  }

  // Observe Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
    
    // Send to analytics
    console.debug("[Performance] LCP:", lastEntry.startTime);
  }).observe({ entryTypes: ["largest-contentful-paint"] });

  // Observe First Input Delay
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      console.debug("[Performance] FID:", (entry as any).processingStart - entry.startTime);
    });
  }).observe({ entryTypes: ["first-input"] });

  // Observe Cumulative Layout Shift
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      console.debug("[Performance] CLS:", (entry as PerformanceEntry & { value: number }).value);
    });
  }).observe({ entryTypes: ["layout-shift"] });
}

/**
 * Measure API response time
 */
export function measureApiResponse<T>(
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  
  return fn().finally(() => {
    const duration = Date.now() - start;
    console.debug(`[API] ${endpoint} - ${duration}ms`);
  });
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(urls: string[]): void {
  if (typeof document === "undefined") return;

  urls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = url.endsWith(".js") ? "script" : url.endsWith(".css") ? "style" : "image";
    document.head.appendChild(link);
  });
}

/**
 * Preconnect to critical origins
 */
export function preconnectCriticalOrigins(origins: string[]): void {
  if (typeof document === "undefined") return;

  origins.forEach((origin) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}
