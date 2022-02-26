module.exports = {
  root: true,

  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],

  globals: {
    ClientAddonApi: false,
    name: 'off'
  },

  rules: {
    'vue/html-self-closing': 'error',
    'vue/no-use-v-if-with-v-for': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/return-in-computed-property': 'warn',
    'vue/multi-word-component-names': 'warn'
  },

  parserOptions: {
    parser: '@babel/eslint-parser',
    babelOptions: {
      cwd: __dirname
    }
  },

  overrides: [
    {
      files: ['*.graphql'],
      parser: '@graphql-eslint/eslint-plugin',
      plugins: ['@graphql-eslint'],
      rules: {
        '@graphql-eslint/known-type-names': 'error'
      }
    }
  ]
}
