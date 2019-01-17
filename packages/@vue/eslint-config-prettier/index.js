module.exports = {
  plugins: ['prettier'],
  extends: [
    'eslint:recommended',
    require.resolve('eslint-config-prettier'),
    require.resolve('eslint-config-prettier/vue')
  ],
  rules: {
    'prettier/prettier': 'warn'
  }
}
