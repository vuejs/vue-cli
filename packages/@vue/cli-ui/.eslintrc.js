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
  ]
}
