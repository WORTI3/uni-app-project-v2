export default {
  clearMocks: true,
  testEnvironment: 'node',
  verbose: true,
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  moduleDirectories: ['node_modules'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 55,
      lines: 70,
      statements: 70,
    },
  },
};
