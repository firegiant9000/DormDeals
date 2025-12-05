// src/utils/debug.ts
export const isDebug = () =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debug') === '1';

export const dlog = (...args: any[]) => {
  if (isDebug()) console.log(...args);
};

// Firestore verbose logging in debug mode
if (typeof window !== 'undefined') {
  import('firebase/firestore').then(({ setLogLevel }) => {
    if (isDebug()) setLogLevel('debug');
  }).catch(() => {
    // Ignore if firestore not available
  });
}
