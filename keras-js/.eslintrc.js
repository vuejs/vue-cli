module.exports = {
  env: {
    browser: true,
    node: true,
    mocha: true,
    es6: true
  },
  parser: 'babel-eslint',
  plugins: ['html'],
  rules: {
    'no-console': 0
  },
  globals: {
    KerasJS: true,
    TEST_DATA: true,
    testGlobals: true,
    chai: true,
    performance: true
  },
  extends: 'eslint:recommended'
}
