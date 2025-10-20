/**
 * ESLint configuration for TypeScript + React.
 * - Uses recommended configs
 * - Disallows warnings in CI via script flag; rules here are errors where appropriate
 */
export default {
  root: true,
  env: { browser: true, es2021: true, node: true, jest: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: undefined,
  },
  settings: {
    react: { version: 'detect' },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist/**', 'coverage/**', 'node_modules/**', '**/*.d.ts'],
  rules: {
    // React/TS adjustments
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',

    // Code quality
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'eqeqeq': ['error', 'smart'],
    'curly': ['error', 'all'],
    'no-var': 'error',
    'prefer-const': ['error', { destructuring: 'all' }],
    'no-unused-vars': 'off',
  },
};


