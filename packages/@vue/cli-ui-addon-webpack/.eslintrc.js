module.exports = {
  root: true,
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  globals: {
    ClientAddonApi: false,
    mapSharedData: false,
    Vue: false,
    name: 'off'
  }
}
