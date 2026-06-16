import { defineConfig } from 'vitest/config';

// Rule tests talk to the Firestore emulator and must run in a node environment,
// separate from the jsdom unit suite. Driven by `npm run test:rules`, which
// boots the emulator first via firebase-tools.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/firestore.rules.test.ts']
  }
});
