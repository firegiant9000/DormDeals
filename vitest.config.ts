import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // Run each test file in a recycled child process rather than the default
    // worker-thread pool. The thread pool keeps one long-lived jsdom realm whose
    // module state (framer-motion, react-router) is never reclaimed between files,
    // so peak heap grows across the suite until the worker OOMs in CI
    // ("Worker terminated due to reaching memory limit: JS heap out of memory").
    // Forks give each file a fresh, isolated heap and fix the leak.
    pool: 'forks',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
      '**/*.e2e.spec.ts',
      '**/*.e2e.test.ts'
    ],
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/__tests__/**/*.{js,ts,jsx,tsx}'
    ]
  }
});

