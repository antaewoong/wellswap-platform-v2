import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring for Edge Runtime
  tracesSampleRate: 1.0,
  
  debug: false,
  
  // Edge Runtime specific configuration
  beforeSend(event, hint) {
    // Filter out edge-specific errors that aren't actionable
    const message = event.message || event.exception?.values?.[0]?.value;
    
    // Skip edge runtime initialization errors
    if (message?.includes('edge-runtime') && message?.includes('init')) {
      return null;
    }
    
    return event;
  },
});