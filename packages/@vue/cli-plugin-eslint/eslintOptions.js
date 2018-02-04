module.exports = {
  extensions: ['.js', '.vue'],
  parserOptions: {
    parser: require.resolve('babel-eslint')
  },
  globals: ['process'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
