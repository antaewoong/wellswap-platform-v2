'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  threshold = 0.1,
  rootMargin = '50px'
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [wasVisible, setWasVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasVisible) {
          setIsVisible(true);
          setWasVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, rootMargin, wasVisible]);

  return { isVisible, elementRef };
};

// Skeleton loading component
export const InsuranceCardSkeleton: React.FC<{ mobile?: boolean }> = ({ mobile = false }) => {
  return (
    <div className={`animate-pulse ${mobile ? 'p-4' : 'p-8'}`}>
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/60 rounded-3xl overflow-hidden">
        <div className={`p-${mobile ? '4' : '8'} space-y-${mobile ? '4' : '6'}`}>
          {/* Header skeleton */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`bg-gray-300 rounded-lg ${mobile ? 'w-10 h-10' : 'w-12 h-12'}`}></div>
              <div className="space-y-2">
                <div className={`bg-gray-300 rounded ${mobile ? 'h-4 w-24' : 'h-5 w-32'}`}></div>
                <div className={`bg-gray-200 rounded ${mobile ? 'h-3 w-20' : 'h-4 w-24'}`}></div>
              </div>
            </div>
            <div className={`bg-gray-300 rounded-full ${mobile ? 'w-16 h-6' : 'w-20 h-8'}`}></div>
          </div>

          {/* Metrics skeleton */}
          {mobile ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="w-5 h-5 bg-gray-300 rounded mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              ))}
            </div>
          )}

          {/* ROI highlight skeleton */}
          <div className="bg-gray-100 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-6 bg-gray-300 rounded w-12"></div>
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex space-x-3">
            <div className={`flex-1 bg-gray-300 rounded-xl ${mobile ? 'h-10' : 'h-12'}`}></div>
            <div className={`flex-1 bg-gray-300 rounded-xl ${mobile ? 'h-10' : 'h-12'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lazy loaded insurance card wrapper
interface LazyInsuranceCardProps {
  listing: any;
  onViewDetails: (listing: any) => void;
  onPurchase: (listing: any) => void;
  mobile?: boolean;
  compact?: boolean;
}

export const LazyInsuranceCard: React.FC<LazyInsuranceCardProps> = (props) => {
  const { isVisible, elementRef } = useIntersectionObserver(0.1, '100px');
  
  // Dynamically import the actual card component
  const InsuranceCard = dynamic(() => import('./InsuranceCard'), {
    loading: () => <InsuranceCardSkeleton mobile={props.mobile} />,
    ssr: false
  });

  return (
    <div ref={elementRef}>
      {isVisible ? (
        <InsuranceCard {...props} />
      ) : (
        <InsuranceCardSkeleton mobile={props.mobile} />
      )}
    </div>
  );
};

// Lazy loader for heavy form components
export const LazyForm: React.FC<{ 
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}> = ({ 
  children, 
  fallback,
  threshold = 0.1 
}) => {
  const { isVisible, elementRef } = useIntersectionObserver(threshold);
  
  const defaultFallback = (
    <div className="animate-pulse">
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-8">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
          <div className="flex space-x-4 pt-4">
            <div className="h-12 bg-gray-300 rounded-xl flex-1"></div>
            <div className="h-12 bg-gray-300 rounded-xl flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={elementRef}>
      {isVisible ? children : (fallback || defaultFallback)}
    </div>
  );
};

// Image lazy loader with progressive enhancement
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  placeholder?: string;
}> = ({ 
  src, 
  alt, 
  className = '', 
  fallback,
  placeholder 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { isVisible, elementRef } = useIntersectionObserver(0.1, '50px');

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div ref={elementRef} className={`relative ${className}`}>
      {isVisible && (
        <>
          {placeholder && !loaded && (
            <img
              src={placeholder}
              alt=""
              className={`${className} blur-sm transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
              aria-hidden="true"
            />
          )}
          <img
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${placeholder ? 'absolute inset-0' : ''}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            loading="lazy"
          />
        </>
      )}
      {!isVisible && (
        <div className={`${className} bg-gray-200 animate-pulse rounded`}></div>
      )}
    </div>
  );
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure initial render
    const measureRender = () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    // Measure load completion
    const measureLoad = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    // Measure first interaction
    const measureInteraction = () => {
      const interactionTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, interactionTime }));
    };

    // Use RAF for render measurement
    requestAnimationFrame(measureRender);
    
    // Listen for load event
    if (document.readyState === 'loading') {
      window.addEventListener('load', measureLoad);
    } else {
      measureLoad();
    }

    // Listen for first user interaction
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    const handleFirstInteraction = () => {
      measureInteraction();
      interactionEvents.forEach(event => 
        document.removeEventListener(event, handleFirstInteraction)
      );
    };

    interactionEvents.forEach(event =>
      document.addEventListener(event, handleFirstInteraction, { once: true })
    );

    return () => {
      window.removeEventListener('load', measureLoad);
      interactionEvents.forEach(event =>
        document.removeEventListener(event, handleFirstInteraction)
      );
    };
  }, []);

  return metrics;
};

export default {
  LazyInsuranceCard,
  LazyForm,
  LazyImage,
  InsuranceCardSkeleton,
  useIntersectionObserver,
  usePerformanceMonitor
};