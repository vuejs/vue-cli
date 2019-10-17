module.exports = (api, options) => {
  require('@vue/cli-plugin-vuex/generator')(api, {
    historyMode: options.routerHistoryMode
  })
}
