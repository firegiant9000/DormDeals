import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking.
 *
 * No-ops unless VITE_SENTRY_DSN is set, so local dev, tests, and any
 * deployment without a DSN stay completely inert (no network, no events).
 * Free tier is 5k events/mo, so sampling is conservative.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Performance tracing: sample lightly to stay inside the free tier.
    tracesSampleRate: 0.1,
    // Only forward unhandled errors in production-like builds; dev noise is
    // already visible in the console.
    enabled: import.meta.env.PROD,
  });
}

export { Sentry };
