import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.

  debug: false,
  
  beforeSend(event, hint) {
    // Filter out known development errors
    if (event.exception) {
      const error = hint.originalException;
      
      // Skip hydration errors in development
      if (process.env.NODE_ENV === 'development') {
        const message = event.exception.values?.[0]?.value;
        if (message?.includes('Hydration')) {
          return null;
        }
      }
      
      // Skip network errors that are not actionable
      if (error && error.message?.includes('Network Error')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Enhanced error context
  beforeBreadcrumb(breadcrumb, hint) {
    // Add custom context for console errors
    if (breadcrumb.category === 'console') {
      breadcrumb.data = {
        ...breadcrumb.data,
        timestamp: new Date().toISOString(),
        userAgent: navigator?.userAgent,
      };
    }
    
    return breadcrumb;
  },
});