module.exports = {
  root: true,

  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],

  globals: {
    ClientAddonApi: false
  },

  plugins: [
    'graphql'
  ],

  rules: {
    'vue/html-self-closing': 'error'
  }
}
