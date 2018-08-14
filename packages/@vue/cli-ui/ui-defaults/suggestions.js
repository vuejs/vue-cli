const { loadModule } = require('@vue/cli-shared-utils')
const invoke = require('@vue/cli/lib/invoke')

const ROUTER = 'org.vue.vue-router-add'
const VUEX = 'org.vue.vuex-add'
const VUE_CONFIG_OPEN = 'org.vue.vue-config-open'

module.exports = api => {
  api.onViewOpen(({ view }) => {
    if (view.id === 'vue-project-plugins') {
      if (!api.hasPlugin('vue-router')) {
        api.addSuggestion({
          id: ROUTER,
          type: 'action',
          label: 'org.vue.cli-service.suggestions.vue-router-add.label',
          message: 'org.vue.cli-service.suggestions.vue-router-add.message',
          link: 'https://router.vuejs.org/',
          async handler () {
            await install(api, 'vue-router')
          }
        })
      }

      if (!api.hasPlugin('vuex')) {
        api.addSuggestion({
          id: VUEX,
          type: 'action',
          label: 'org.vue.cli-service.suggestions.vuex-add.label',
          message: 'org.vue.cli-service.suggestions.vuex-add.message',
          link: 'https://vuex.vuejs.org/',
          async handler () {
            await install(api, 'vuex')
          }
        })
      }
    } else {
      [ROUTER, VUEX].forEach(id => api.removeSuggestion(id))
    }

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

async function install (api, id) {
  api.setProgress({
    status: 'org.vue.cli-service.suggestions.progress',
    args: [id],
    progress: -1
  })

  const name = id === 'vue-router' ? 'router' : id
  const context = api.getCwd()

  let error

  try {
    await invoke.runGenerator(context, {
      id: `core:${name}`,
      apply: loadModule(`@vue/cli-service/generator/${name}`, context)
    })
  } catch (e) {
    error = e
  }

  api.removeProgress()

  if (error) throw error
}
