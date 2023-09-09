module.exports = api => {
  const CONFIG = 'org.vue.pwa'

  // Config file
  api.describeConfig({
    id: CONFIG,
    name: 'PWA',
    description: 'org.vue.pwa.config.pwa.description',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa#configuration',
    files: {
      vue: {
        js: ['vue.config.js']
      },
      manifest: {
        json: ['public/manifest.json']
      }
    },
    onRead: ({ data }) => {
      // Dirty hack here: only in onRead can we delete files from the original data.
      // Remove (or, don't create the file) manifest.json if no actual content in it.
      if (!data.manifest || !Object.keys(data.manifest).length) {
        delete data.manifest
      }

      return {
        prompts: [
          {
            name: 'workboxPluginMode',
            type: 'list',
            message: 'org.vue.pwa.config.pwa.workboxPluginMode.message',
            description: 'org.vue.pwa.config.pwa.workboxPluginMode.description',
            link: 'https://developer.chrome.com/docs/workbox/modules/workbox-webpack-plugin/#which-plugin-to-use',
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
            message: 'org.vue.pwa.config.pwa.name.message',
            description: 'org.vue.pwa.config.pwa.name.description',
            value: data.vue && data.vue.pwa && data.vue.pwa.name
          },
          {
            name: 'themeColor',
            type: 'color',
            message: 'org.vue.pwa.config.pwa.themeColor.message',
            description: 'org.vue.pwa.config.pwa.themeColor.description',
            default: '#4DBA87',
            value: data.vue && data.vue.pwa && data.vue.pwa.themeColor
          },
          {
            name: 'backgroundColor',
            type: 'color',
            message: 'org.vue.pwa.config.pwa.backgroundColor.message',
            description: 'org.vue.pwa.config.pwa.backgroundColor.description',
            default: '#000000',
            value:
              (data.vue &&
                data.vue.pwa &&
                data.vue.pwa.manifestOptions &&
                data.vue.pwa.manifestOptions.background_color) ||
              (data.manifest && data.manifest.background_color),
            skipSave: true
          },
          {
            name: 'msTileColor',
            type: 'color',
            message: 'org.vue.pwa.config.pwa.msTileColor.message',
            description: 'org.vue.pwa.config.pwa.msTileColor.description',
            default: '#000000',
            value: data.vue && data.vue.pwa && data.vue.pwa.msTileColor
          },
          {
            name: 'appleMobileWebAppStatusBarStyle',
            type: 'input',
            message: 'org.vue.pwa.config.pwa.appleMobileWebAppStatusBarStyle.message',
            description: 'org.vue.pwa.config.pwa.appleMobileWebAppStatusBarStyle.description',
            default: 'default',
            value: data.vue && data.vue.pwa && data.vue.pwa.appleMobileWebAppStatusBarStyle
          },
          {
            name: 'manifestCrossorigin',
            type: 'list',
            message: 'org.vue.pwa.config.pwa.manifestCrossorigin.message',
            description: 'org.vue.pwa.config.pwa.manifestCrossorigin.description',
            default: null,
            value: data.vue && data.vue.pwa && data.vue.pwa.manifestCrossorigin,
            choices: [
              {
                name: 'none',
                value: null
              },
              {
                name: 'anonymous',
                value: 'anonymous'
              },
              {
                name: 'use-credentials',
                value: 'use-credentials'
              }
            ]
          }
        ]
      }
    },
    onWrite: async ({ api: onWriteApi, data, prompts }) => {
      const result = {}
      for (const prompt of prompts.filter(p => !p.raw.skipSave)) {
        result[`pwa.${prompt.id}`] = await onWriteApi.getAnswer(prompt.id)
      }

      const backgroundColor = await onWriteApi.getAnswer('backgroundColor')
      if (!data.manifest && backgroundColor) {
        result['pwa.manifestOptions.background_color'] = backgroundColor
      }

      onWriteApi.setData('vue', result)

      // Update app manifest (only when there's a manifest.json file,
      // otherwise it will be inferred from options in vue.config.js)
      if (data.manifest) {
        const name = result.name
        if (name) {
          onWriteApi.setData('manifest', {
            name,
            short_name: name
          })
        }

        const themeColor = result.themeColor
        if (themeColor) {
          onWriteApi.setData('manifest', {
            theme_color: themeColor
          })
        }

        if (backgroundColor) {
          onWriteApi.setData('manifest', {
            background_color: backgroundColor
          })
        }
      }
    }
  })

  const OPEN_VUE = 'org.vue.pwa.open-vue'
  const OPEN_MANIFEST = 'org.vue.pwa.open-manifest'

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
          label: 'org.vue.pwa.suggestions.open-vue.label',
          handler () {
            const file = config.foundFiles.vue.path
            const { launch } = require('@vue/cli-shared-utils')
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
          label: 'org.vue.pwa.suggestions.open-manifest.label',
          handler () {
            const file = config.foundFiles.manifest.path
            const { launch } = require('@vue/cli-shared-utils')
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
