const VUE_CONFIG_OPEN = 'org.vue.vue-config-open'

module.exports = api => {
  api.onViewOpen(({ view }) => {
    if (view.id !== 'vue-project-configurations') {
      api.removeSuggestion(VUE_CONFIG_OPEN)
    }
  })

  api.onConfigRead(({ config }) => {
    if (config.id === 'org.vue.vue-cli') {
      if (config.foundFiles.vue) {
        api.addSuggestion({
          id: VUE_CONFIG_OPEN,
          type: 'action',
          label: 'org.vue.vue-webpack.suggestions.vue-config-open',
          handler () {
            const file = config.foundFiles.vue.path
            console.log('open', file)
            const { launch } = require('@vue/cli-shared-utils')
            launch(file)
            return {
              keep: true
            }
          }
        })
        return
      }
    }
    api.removeSuggestion(VUE_CONFIG_OPEN)
  })
}
