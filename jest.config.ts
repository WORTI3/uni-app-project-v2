export default {
  clearMocks: true,
  testEnvironment: 'node',
  verbose: true,
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  moduleDirectories: ['node_modules'],
  setupFiles: ['<rootDir>/tests/setup.ts'], // sets up fake environtment variables for test
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },
};
