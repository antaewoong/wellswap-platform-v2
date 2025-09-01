import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  debug: false,
  
  // Server-specific configuration
  beforeSend(event, hint) {
    // Filter sensitive data from server errors
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      // Remove sensitive query parameters
      if (event.request.query_string) {
        const url = new URL(`http://example.com?${event.request.query_string}`);
        url.searchParams.delete('token');
        url.searchParams.delete('key');
        url.searchParams.delete('secret');
        event.request.query_string = url.searchParams.toString();
      }
    }
    
    // Skip database connection warnings in development
    if (process.env.NODE_ENV === 'development') {
      const message = event.message || event.exception?.values?.[0]?.value;
      if (message?.includes('Database') && message?.includes('connection')) {
        return null;
      }
    }
    
    return event;
  },
  
  beforeBreadcrumb(breadcrumb, hint) {
    // Skip sensitive database queries
    if (breadcrumb.category === 'query') {
      breadcrumb.data = {
        ...breadcrumb.data,
        query: '[REDACTED]', // Don't log actual SQL queries
      };
    }
    
    return breadcrumb;
  },
});