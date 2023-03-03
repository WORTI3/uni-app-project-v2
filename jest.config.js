const config = {
  testEnvironment: "node",
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 55,
      lines: 70,
      statements: 70
    },
  },
};

module.exports = config;
