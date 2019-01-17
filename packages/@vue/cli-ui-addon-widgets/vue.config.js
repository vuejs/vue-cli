const { clientAddonConfig } = require('@vue/cli-ui')

module.exports = {
  ...clientAddonConfig({
    id: 'org.vue.webpack.client-addon',
    port: 8097
  })
}
