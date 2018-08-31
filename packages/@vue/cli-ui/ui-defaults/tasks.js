const path = require('path')
const fs = require('fs-extra')
const { processStats } = require('./utils/stats')

module.exports = api => {
  const { getSharedData, setSharedData, removeSharedData } = api.namespace('org.vue.webpack.')

  let firstRun = true
  let hadFailed = false

  // Specific to each modes (serve, build, ...)
  const fields = {
    status: null,
    progress: {},
    operations: null,
    stats: null,
    sizes: null,
    problems: null,
    url: null
  }

  // Common fields for all mode
  const commonFields = {
    'modern-mode': false
  }

  // Init data
  api.onProjectOpen(setup)
  api.onPluginReload(setup)

  function setup () {
    for (const key of ['serve', 'build', 'build-modern']) {
      setupSharedData(key)
    }
    setupCommonData()
  }

  // Called when opening a project
  function setupSharedData (mode) {
    resetSharedData(mode)
  }

  // Called when opening a project
  function setupCommonData () {
    for (const field in commonFields) {
      setSharedData(field, getSharedDataInitialValue(field, commonFields[field]))
    }
  }

  function resetSharedData (mode, clear = false) {
    for (const field in fields) {
      const id = `${mode}-${field}`
      setSharedData(id, getSharedDataInitialValue(id, fields[field], clear))
    }
  }

  function getSharedDataInitialValue (id, defaultValue, clear) {
    if (!clear) {
      const data = getSharedData(id)
      if (data != null) return data.value
    }
    return defaultValue
  }

  async function onWebpackMessage ({ data: message }) {
    if (message.webpackDashboardData) {
      const modernMode = getSharedData('modern-mode').value
      const type = message.webpackDashboardData.type

      for (const data of message.webpackDashboardData.value) {
        const id = `${type}-${data.type}`

        if (data.type === 'stats') {
          // Stats are read from a file
          const statsFile = path.resolve(api.getCwd(), `./node_modules/.stats-${type}.json`)
          const value = await fs.readJson(statsFile)
          const { stats, analyzer } = processStats(value)
          setSharedData(id, stats)
          setSharedData(`${id}-analyzer`, analyzer)
          await fs.remove(statsFile)
        } else if (data.type === 'progress') {
          if (type === 'serve' || !modernMode) {
            setSharedData(id, {
              [type]: data.value
            })
          } else {
            // Display two progress bars
            const progress = getSharedData(id).value
            progress[type] = data.value
            for (const t of ['build', 'build-modern']) {
              setSharedData(`${t}-${data.type}`, {
                build: progress.build || 0,
                'build-modern': progress['build-modern'] || 0
              })
            }
          }
        } else {
          // Don't display success until both build and build-modern are done
          if (type !== 'serve' && modernMode && data.type === 'status' && data.value === 'Success') {
            if (type === 'build-modern') {
              for (const t of ['build', 'build-modern']) {
                setSharedData(`${t}-status`, data.value)
              }
            }
          } else {
            setSharedData(id, data.value)
          }

          // Notifications
          if (type === 'serve' && data.type === 'status') {
            if (data.value === 'Failed') {
              api.notify({
                title: 'Build failed',
                message: 'The build has errors.',
                icon: 'error'
              })
              hadFailed = true
            } else if (data.value === 'Success') {
              if (hadFailed) {
                api.notify({
                  title: 'Build fixed',
                  message: 'The build succeeded.',
                  icon: 'done'
                })
                hadFailed = false
              } else if (firstRun) {
                api.notify({
                  title: 'App ready',
                  message: 'The build succeeded.',
                  icon: 'done'
                })
                firstRun = false
              }
            }
          }
        }
      }
    }
  }

  // Tasks
  const views = {
    views: [
      {
        id: 'org.vue.webpack.views.dashboard',
        label: 'org.vue.vue-webpack.dashboard.title',
        icon: 'dashboard',
        component: 'org.vue.webpack.components.dashboard'
      },
      {
        id: 'org.vue.webpack.views.analyzer',
        label: 'org.vue.vue-webpack.analyzer.title',
        icon: 'donut_large',
        component: 'org.vue.webpack.components.analyzer'
      }
    ],
    defaultView: 'org.vue.webpack.views.dashboard'
  }
  api.describeTask({
    match: /vue-cli-service serve(\s+--\S+(\s+\S+)?)*$/,
    description: 'org.vue.vue-webpack.tasks.serve.description',
    link: 'https://cli.vuejs.org/guide/cli-service.html#vue-cli-service-serve',
    icon: '/public/webpack-logo.png',
    prompts: [
      {
        name: 'open',
        type: 'confirm',
        default: false,
        description: 'org.vue.vue-webpack.tasks.serve.open'
      },
      {
        name: 'mode',
        type: 'list',
        default: 'development',
        choices: [
          {
            name: 'development',
            value: 'development'
          },
          {
            name: 'production',
            value: 'production'
          },
          {
            name: 'test',
            value: 'test'
          },
          {
            name: '(unset)',
            value: ''
          }
        ],
        description: 'org.vue.vue-webpack.tasks.serve.mode'
      },
      {
        name: 'host',
        type: 'input',
        default: '',
        description: 'org.vue.vue-webpack.tasks.serve.host'
      },
      {
        name: 'port',
        type: 'input',
        default: undefined,
        description: 'org.vue.vue-webpack.tasks.serve.port'
      },
      {
        name: 'https',
        type: 'confirm',
        default: false,
        description: 'org.vue.vue-webpack.tasks.serve.https'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      // Args
      if (answers.open) args.push('--open')
      if (answers.mode) args.push('--mode', answers.mode)
      if (answers.host) args.push('--host', answers.host)
      if (answers.port) args.push('--port', answers.port)
      if (answers.https) args.push('--https')
      args.push('--dashboard')

      // Data
      resetSharedData('serve', true)
      firstRun = true
      hadFailed = false
    },
    onRun: () => {
      api.ipcOn(onWebpackMessage)
    },
    onExit: () => {
      api.ipcOff(onWebpackMessage)
      removeSharedData('serve-url')
    },
    ...views
  })
  api.describeTask({
    match: /vue-cli-service build(\s+--\S+(\s+\S+)?)*$/,
    description: 'org.vue.vue-webpack.tasks.build.description',
    link: 'https://cli.vuejs.org/guide/cli-service.html#vue-cli-service-build',
    icon: '/public/webpack-logo.png',
    prompts: [
      {
        name: 'modern',
        type: 'confirm',
        default: false,
        message: 'org.vue.vue-webpack.tasks.build.modern.label',
        description: 'org.vue.vue-webpack.tasks.build.modern.description',
        link: 'https://cli.vuejs.org/guide/browser-compatibility.html#modern-mode'
      },
      {
        name: 'mode',
        type: 'list',
        default: 'production',
        choices: [
          {
            name: 'development',
            value: 'development'
          },
          {
            name: 'production',
            value: 'production'
          },
          {
            name: 'test',
            value: 'test'
          },
          {
            name: '(unset)',
            value: ''
          }
        ],
        description: 'org.vue.vue-webpack.tasks.build.mode'
      },
      {
        name: 'dest',
        type: 'input',
        default: 'dist',
        description: 'org.vue.vue-webpack.tasks.build.dest'
      },
      {
        name: 'target',
        type: 'list',
        default: 'app',
        choices: [
          {
            name: 'org.vue.vue-webpack.tasks.build.target.app',
            value: 'app'
          },
          {
            name: 'org.vue.vue-webpack.tasks.build.target.lib',
            value: 'lib'
          },
          {
            name: 'org.vue.vue-webpack.tasks.build.target.wc',
            value: 'wc'
          },
          {
            name: 'org.vue.vue-webpack.tasks.build.target.wc-async',
            value: 'wc-async'
          }
        ],
        description: 'org.vue.vue-webpack.tasks.build.target.description'
      },
      {
        name: 'name',
        type: 'input',
        default: '',
        description: 'org.vue.vue-webpack.tasks.build.name'
      },
      {
        name: 'watch',
        type: 'confirm',
        default: false,
        description: 'org.vue.vue-webpack.tasks.build.watch'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      // Args
      if (answers.mode) args.push('--mode', answers.mode)
      if (answers.dest) args.push('--dest', answers.dest)
      if (answers.target) args.push('--target', answers.target)
      if (answers.name) args.push('--name', answers.name)
      if (answers.watch) args.push('--watch')
      if (answers.modern) args.push('--modern')
      setSharedData('modern-mode', !!answers.modern)
      args.push('--dashboard')

      // Data
      resetSharedData('build', true)
      resetSharedData('build-modern', true)
    },
    onRun: () => {
      api.ipcOn(onWebpackMessage)
    },
    onExit: () => {
      api.ipcOff(onWebpackMessage)
    },
    ...views
  })
  // vue inspect
  api.addTask({
    name: 'inspect',
    command: 'vue-cli-service inspect',
    description: 'org.vue.vue-webpack.tasks.inspect.description',
    link: 'https://cli.vuejs.org/guide/webpack.html#inspecting-the-project-s-webpack-config',
    icon: '/public/webpack-inspect-logo.png',
    prompts: [
      {
        name: 'mode',
        type: 'list',
        default: 'production',
        choices: [
          {
            name: 'development',
            value: 'development'
          },
          {
            name: 'production',
            value: 'production'
          },
          {
            name: 'test',
            value: 'test'
          },
          {
            name: '(unset)',
            value: ''
          }
        ],
        description: 'org.vue.vue-webpack.tasks.inspect.mode'
      },
      {
        name: 'verbose',
        type: 'confirm',
        default: false,
        description: 'org.vue.vue-webpack.tasks.inspect.verbose'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.mode) args.push('--mode', answers.mode)
      if (answers.verbose) args.push('--verbose')
    }
  })

  if (process.env.VUE_APP_CLI_UI_DEV) {
    // Add dynamic components in dev mode (webpack dashboard & analyzer)
    api.addClientAddon({
      id: 'org.vue.webpack.client-addon.dev',
      url: 'http://localhost:8096/index.js'
    })
  } else {
    // Webpack dashboard
    api.addClientAddon({
      id: 'org.vue.webpack.client-addon',
      path: '@vue/cli-ui-addon-webpack/dist'
    })
  }

  // Open app button
  api.ipcOn(({ data }) => {
    if (data.vueServe) {
      setSharedData('serve-url', data.vueServe.url)
    }
  })
}
