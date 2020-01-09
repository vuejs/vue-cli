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

  plugins: [
    'graphql'
  ],

  rules: {
    'vue/html-self-closing': 'error',
    'vue/no-use-v-if-with-v-for': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/return-in-computed-property': 'warn',
  },

  parserOptions: {
    parser: 'babel-eslint'
  }
}
