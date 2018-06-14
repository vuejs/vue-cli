const { loadModule } = require('@vue/cli/lib/util/module')
const invoke = require('@vue/cli/lib/invoke')

const ROUTER = 'vue-router-add'
const VUEX = 'vuex-add'
const VUE_CONFIG_OPEN = 'vue-config-open'

module.exports = api => {
  api.onViewOpen(({ view }) => {
    if (view.id === 'vue-project-plugins') {
      if (!api.hasPlugin('vue-router')) {
        api.addSuggestion({
          id: ROUTER,
          type: 'action',
          label: 'cli-service.suggestions.vue-router-add.label',
          message: 'cli-service.suggestions.vue-router-add.message',
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
          label: 'cli-service.suggestions.vuex-add.label',
          message: 'cli-service.suggestions.vuex-add.message',
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
    if (config.id === 'vue-cli') {
      if (config.foundFiles.vue) {
        api.addSuggestion({
          id: VUE_CONFIG_OPEN,
          type: 'action',
          label: 'vue-webpack.suggestions.vue-config-open',
          handler () {
            const file = config.foundFiles.vue.path
            console.log('open', file)
            const launch = require('launch-editor')
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
    status: 'cli-service.suggestions.progress',
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
