module.exports = {
  extends: [
    '@vue/standard'
  ],
  globals: {
    name: 'off'
  },
  rules: {
    indent: ['error', 2, {
      MemberExpression: 'off'
    }],
    'no-shadow': ['error'],
    'node/no-extraneous-require': ['error', {
      allowModules: [
        '@vue/cli-service',
        '@vue/cli-test-utils'
      ]
    }]
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js', '**/cli-test-utils/**/*.js'],
      env: {
        jest: true
      },
      rules: {
        'node/no-extraneous-require': 'off'
      }
    }
  ]
}
