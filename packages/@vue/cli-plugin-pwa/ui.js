module.exports = api => {
  const CONFIG = 'pwa'

  // Config file
  api.describeConfig({
    id: CONFIG,
    name: 'PWA',
    description: 'pwa.config.pwa.description',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa#configuration',
    files: {
      vue: {
        js: ['vue.config.js']
      },
      manifest: {
        json: ['public/manifest.json']
      }
    },
    onRead: ({ data, cwd }) => {
      return {
        prompts: [
          {
            name: 'workboxPluginMode',
            type: 'list',
            message: 'pwa.config.pwa.workboxPluginMode.message',
            description: 'pwa.config.pwa.workboxPluginMode.description',
            link: 'https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#which_plugin_to_use',
            default: 'GenerateSW',
            value: data.vue && data.vue.pwa && data.vue.pwa.workboxPluginMode,
            choices: [
              {
                name: 'GenerateSW',
                value: 'GenerateSW'
              },
              {
                name: 'InjectManifest',
                value: 'InjectManifest'
              }
            ]
          },
          {
            name: 'name',
            type: 'input',
            message: 'pwa.config.pwa.name.message',
            description: 'pwa.config.pwa.name.description',
            value: data.vue && data.vue.pwa && data.vue.pwa.name
          },
          {
            name: 'themeColor',
            type: 'color',
            message: 'pwa.config.pwa.themeColor.message',
            description: 'pwa.config.pwa.themeColor.description',
            default: '#4DBA87',
            value: data.vue && data.vue.pwa && data.vue.pwa.themeColor
          },
          {
            name: 'backgroundColor',
            type: 'color',
            message: 'pwa.config.pwa.backgroundColor.message',
            description: 'pwa.config.pwa.backgroundColor.description',
            default: '#000000',
            value: data.manifest && data.manifest.background_color,
            skipSave: true
          },
          {
            name: 'msTileColor',
            type: 'color',
            message: 'pwa.config.pwa.msTileColor.message',
            description: 'pwa.config.pwa.msTileColor.description',
            default: '#000000',
            value: data.vue && data.vue.pwa && data.vue.pwa.msTileColor
          },
          {
            name: 'appleMobileWebAppStatusBarStyle',
            type: 'input',
            message: 'pwa.config.pwa.appleMobileWebAppStatusBarStyle.message',
            description: 'pwa.config.pwa.appleMobileWebAppStatusBarStyle.description',
            default: 'default',
            value: data.vue && data.vue.pwa && data.vue.pwa.appleMobileWebAppStatusBarStyle
          }
        ]
      }
    },
    onWrite: async ({ api, prompts, cwd }) => {
      const result = {}
      for (const prompt of prompts.filter(p => !p.raw.skipSave)) {
        result[`pwa.${prompt.id}`] = await api.getAnswer(prompt.id)
      }
      api.setData('vue', result)

      // Update app manifest

      const name = result['pwa.name']
      if (name) {
        api.setData('manifest', {
          name,
          short_name: name
        })
      }

      const themeColor = result['pwa.themeColor']
      if (themeColor) {
        api.setData('manifest', {
          theme_color: themeColor
        })
      }

      const backgroundColor = await api.getAnswer('backgroundColor')
      if (backgroundColor) {
        api.setData('manifest', {
          background_color: backgroundColor
        })
      }
    }
  })

  const OPEN_VUE = 'vue-pwa-open-vue'
  const OPEN_MANIFEST = 'vue-pwa-open-manifest'

  api.onViewOpen(({ view }) => {
    if (view.id !== 'vue-project-configurations') {
      removeSuggestions()
    }
  })

  api.onConfigRead(({ config }) => {
    if (config.id === CONFIG) {
      if (config.foundFiles.vue) {
        api.addSuggestion({
          id: OPEN_VUE,
          type: 'action',
          label: 'pwa.suggestions.open-vue.label',
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
      } else {
        api.removeSuggestion(OPEN_VUE)
      }
      if (config.foundFiles.manifest) {
        api.addSuggestion({
          id: OPEN_MANIFEST,
          type: 'action',
          label: 'pwa.suggestions.open-manifest.label',
          handler () {
            const file = config.foundFiles.manifest.path
            console.log('open', file)
            const launch = require('launch-editor')
            launch(file)
            return {
              keep: true
            }
          }
        })
      } else {
        api.removeSuggestion(OPEN_MANIFEST)
      }
    } else {
      removeSuggestions()
    }
  })

  function removeSuggestions () {
    [OPEN_VUE, OPEN_MANIFEST].forEach(id => api.removeSuggestion(id))
  }
}
