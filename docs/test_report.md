Date: 10/20/2025
Tester: Hans Trosclair
Environment: Development

Total Test Cases: 1
Passed: 1
Failed: 0
Blocked: 0
Not Executed: 0

Pass Rate: 100%

Critical Issues Found: 0
High Priority Issues: 0
Medium Priority Issues: 0
Low Priority Issues: 0

Output:

fa25team04 main  ❯ npm test

> dormdeals@1.0.0 test
> jest

● Validation Warning:

  Unknown option "moduleNameMapping" with value {"^@/(.*)$": "<rootDir>/src/$1"} was found.
  This is probably a typing mistake. Fixing it will remove this message.

  Configuration Documentation:
  https://jestjs.io/docs/configuration

● Validation Warning:

  Unknown option "moduleNameMapping" with value {"^@/(.*)$": "<rootDir>/src/$1"} was found.
  This is probably a typing mistake. Fixing it will remove this message.

  Configuration Documentation:
  https://jestjs.io/docs/configuration

ts-jest[config] (WARN) message TS151001: If you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
 PASS  src/__tests__/App.test.tsx
  Basic Test
    ✓ should pass (2 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.689 s, estimated 1 s
Ran all test suites.
