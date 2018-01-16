module.exports = {
  plugins: ['prettier'],
  extends: [
    require.resolve('eslint-config-prettier')
  ],
  rules: {
    'prettier/prettier': 'warn'
  }
}
