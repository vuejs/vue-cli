module.exports = {
  transform: {
    '^.+\\.[j|t]sx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest'
  },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/scripts/testSetup.js'],
  testMatch: ['**/__tests__/**/*.spec.js']
}
