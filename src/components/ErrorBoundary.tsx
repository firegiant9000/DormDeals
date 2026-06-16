import React from 'react';
import { Sentry } from '@/lib/sentry';

function FallbackUI() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-gray-500 max-w-md">
        An unexpected error occurred. The team has been notified. Try reloading the page.
      </p>
      <button onClick={() => window.location.reload()} className="btn-primary px-6 py-2">
        Reload
      </button>
    </div>
  );
}

/**
 * App-wide error boundary. Renders the fallback on any render-time crash and,
 * when Sentry is initialized, reports the error. Safe to use without a DSN —
 * Sentry.ErrorBoundary still catches and shows the fallback, it just won't send.
 */
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Sentry.ErrorBoundary fallback={<FallbackUI />}>{children}</Sentry.ErrorBoundary>
);

export default ErrorBoundary;
