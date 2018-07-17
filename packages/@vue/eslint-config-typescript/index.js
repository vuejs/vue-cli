module.exports = {
  plugins: ['typescript'],
  parserOptions: {
    parser: require.resolve('typescript-eslint-parser')
  },
  rules: {
    // https://github.com/eslint/typescript-eslint-parser#known-issues
    'no-undef': 'off',
    'no-unused-vars': 'off',
    // https://github.com/eslint/typescript-eslint-parser/issues/445
    // 'typescript/no-unused-vars': 'error',
    // https://github.com/vuejs/vue-cli/issues/1672
    'space-infix-ops': 'off'
  }
}
