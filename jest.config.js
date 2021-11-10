// Todo: reduce test time. (e.g. esbuild-jest, swc-jest)
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/scripts/testSetup.js'],
  testMatch: ['**/__tests__/**/*.spec.js']
}
