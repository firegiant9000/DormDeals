import { getAnalytics, isSupported, logEvent, setUserId, type Analytics } from 'firebase/analytics';
import app from '@/firebase';

/**
 * Named analytics events that feed the conversion funnel
 * (visit → signup → verify → first listing → first message → first sale).
 * Later months add `verify`, `message`, and `sale`.
 */
export interface AnalyticsEventParams {
  listing_view: { listing_id: string; category?: string };
  listing_create: { listing_id: string; category?: string; price?: number };
  search: { query: string; results_count?: number };
  signup_complete: { method: 'email' };
  cart_add: { listing_id: string };
}

export type AnalyticsEventName = keyof AnalyticsEventParams;

let analytics: Analytics | null = null;
let initialized = false;

/**
 * Initialize Firebase Analytics. No-ops unless a measurement ID is configured
 * and the environment supports it (guards against SSR / unsupported browsers /
 * the test runner). Safe to call once at app startup.
 */
export async function initAnalytics(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return;

  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
    }
  } catch {
    // Analytics is best-effort; never let it break app startup.
    analytics = null;
  }
}

/**
 * Emit a named, typed funnel event. Silently no-ops when analytics is not
 * initialized (no DSN/measurement ID, dev, or tests).
 */
export function trackEvent<E extends AnalyticsEventName>(
  event: E,
  params: AnalyticsEventParams[E]
): void {
  if (!analytics) return;
  // Cast to the custom-event (string) overload: some of our names collide with
  // GA reserved events whose built-in param types differ from ours.
  logEvent(analytics, event as string, params);
}

/** Associate subsequent events with a user id (cleared on logout via null). */
export function setAnalyticsUser(userId: string | null): void {
  if (!analytics) return;
  setUserId(analytics, userId);
}
