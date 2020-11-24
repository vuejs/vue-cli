module.exports = {
  'testEnvironment': 'node',
  'setupFiles': [
    '<rootDir>/scripts/testSetup.js'
  ],
  'testMatch': [
    '**/__tests__/**/*.spec.js'
  ]
}

if (process.env.WEBPACK4) {
  module.exports.moduleNameMapper = {
    '^webpack$': 'webpack-4',
    '^webpack/(.*)': 'webpack-4/$1'
  }
}
