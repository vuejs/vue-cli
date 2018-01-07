module.exports = {
  extensions: ['.js', '.vue'],
  parserOptions: {
    parser: require.resolve('babel-eslint')
  },
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
