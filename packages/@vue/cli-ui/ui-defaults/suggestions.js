const { semver, loadModule } = require('@vue/cli-shared-utils')
const invoke = require('@vue/cli/lib/invoke')
const add = require('@vue/cli/lib/add')

const ROUTER = 'org.vue.vue-router-add'
const VUEX = 'org.vue.vuex-add'
const VUE_CONFIG_OPEN = 'org.vue.vue-config-open'

module.exports = api => {
  api.onViewOpen(({ view }) => {
    if (view.id === 'vue-project-plugins') {
      if (!api.hasPlugin('router')) {
        api.addSuggestion({
          id: ROUTER,
          type: 'action',
          label: 'org.vue.cli-service.suggestions.vue-router-add.label',
          message: 'org.vue.cli-service.suggestions.vue-router-add.message',
          link: 'https://router.vuejs.org/',
          async handler () {
            await install(api, 'router')
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

  const context = api.getCwd()

  let error

  try {
    const servicePkg = loadModule('@vue/cli-service/package.json', context)
    // @vue/cli-plugin-router is not compatible with @vue/cli-service v3,
    // so we have to check for the version and call the right generator
    if (semver.satisfies(servicePkg.version, '3.x')) {
      await invoke.runGenerator(context, {
        id: `core:${id}`,
        apply: loadModule(`@vue/cli-service/generator/${id}`, context)
      })
    } else {
      // FIXME: a temporary fix for adding router plugin
      // should implement a plugin prompt ui later
      await add(id, { $inlineOptions: '{}' }, context)
    }
  } catch (e) {
    error = e
  }

  api.removeProgress()

  if (error) throw error
}
