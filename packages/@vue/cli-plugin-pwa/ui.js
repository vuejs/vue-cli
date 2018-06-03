const path = require('path')
const fs = require('fs')

function readAppManifest (cwd) {
  const manifestPath = path.join(cwd, 'public/manifest.json')
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf8' }))
    } catch (e) {
      console.log(`Can't read JSON in ${manifestPath}`)
    }
  }
}

function updateAppManifest (cwd, handler) {
  const manifestPath = path.join(cwd, 'public/manifest.json')
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf8' }))
      handler(manifest)
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), { encoding: 'utf8' })
    } catch (e) {
      console.log(`Can't update JSON in ${manifestPath}`)
    }
  }
}

module.exports = api => {
  // Config file
  api.describeConfig({
    id: 'pwa',
    name: 'PWA',
    description: 'pwa.config.pwa.description',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa#configuration',
    files: {
      js: ['vue.config.js']
    },
    onRead: ({ data, cwd }) => {
      const manifest = readAppManifest(cwd)
      return {
        prompts: [
          {
            name: 'workboxPluginMode',
            type: 'list',
            message: 'pwa.config.pwa.workboxPluginMode.message',
            description: 'pwa.config.pwa.workboxPluginMode.description',
            link: 'https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#which_plugin_to_use',
            default: 'GenerateSW',
            value: data.pwa && data.pwa.workboxPluginMode,
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
            value: data.pwa && data.pwa.name
          },
          {
            name: 'themeColor',
            type: 'color',
            message: 'pwa.config.pwa.themeColor.message',
            description: 'pwa.config.pwa.themeColor.description',
            default: '#4DBA87',
            value: data.pwa && data.pwa.themeColor
          },
          {
            name: 'backgroundColor',
            type: 'color',
            message: 'pwa.config.pwa.backgroundColor.message',
            description: 'pwa.config.pwa.backgroundColor.description',
            default: '#000000',
            value: manifest && manifest.background_color,
            skipSave: true
          },
          {
            name: 'msTileColor',
            type: 'color',
            message: 'pwa.config.pwa.msTileColor.message',
            description: 'pwa.config.pwa.msTileColor.description',
            default: '#000000',
            value: data.pwa && data.pwa.msTileColor
          },
          {
            name: 'appleMobileWebAppStatusBarStyle',
            type: 'input',
            message: 'pwa.config.pwa.appleMobileWebAppStatusBarStyle.message',
            description: 'pwa.config.pwa.appleMobileWebAppStatusBarStyle.description',
            default: 'default',
            value: data.pwa && data.pwa.appleMobileWebAppStatusBarStyle
          }
        ]
      }
    },
    onWrite: async ({ api, prompts, cwd }) => {
      const result = {}
      for (const prompt of prompts.filter(p => !p.raw.skipSave)) {
        result[`pwa.${prompt.id}`] = await api.getAnswer(prompt.id)
      }
      api.setData(result)

      // Update app manifest

      const name = result['pwa.name']
      if (name) {
        updateAppManifest(cwd, manifest => {
          manifest.name = name
          manifest.short_name = name
        })
      }

      const themeColor = result['pwa.themeColor']
      if (themeColor) {
        updateAppManifest(cwd, manifest => {
          manifest.theme_color = themeColor
        })
      }

      const backgroundColor = await api.getAnswer('backgroundColor')
      if (backgroundColor) {
        updateAppManifest(cwd, manifest => {
          manifest.background_color = backgroundColor
        })
      }
    }
  })
}
