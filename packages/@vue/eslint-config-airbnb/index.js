module.exports = {
  extends: [
    require.resolve('eslint-config-airbnb-base')
  ],
  settings: {
    'import/resolver': {
      webpack: {
        config: require.resolve('@vue/cli-service/webpack.config.js')
      }
    },
    'import/extensions': [
      '.js',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx'
    ]
  },
  rules: {
    'import/extensions': ['error', 'always', {
      js: 'never',
      mjs: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never'
    }],
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'state', // for vuex state
        'acc', // for reduce accumulators
        'e' // for e.returnvalue
      ]
    }]
  }
}
