module.exports = {
  plugins: ['prettier'],
  extends: [
    'eslint:recommended',
    require.resolve('eslint-config-prettier')
  ],
  rules: {
    'prettier/prettier': 'warn'
  }
}
