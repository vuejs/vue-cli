/* eslint-disable vue-libs/no-async-functions */

module.exports = api => {
  const { setSharedData, getSharedData } = api.namespace('webpack-dashboard-')

  function resetSharedData (key) {
    setSharedData(`${key}-status`, null)
    setSharedData(`${key}-progress`, 0)
    setSharedData(`${key}-operations`, null)
    setSharedData(`${key}-stats`, null)
    setSharedData(`${key}-sizes`, null)
    setSharedData(`${key}-problems`, null)
  }

  function onWebpackMessage ({ data: message }) {
    if (message.webpackDashboardData) {
      const type = message.webpackDashboardData.type
      for (const data of message.webpackDashboardData.value) {
        setSharedData(`${type}-${data.type}`, data.value)
      }
    } else if (message.webpackDashboardDone) {
      api.ipcSend({
        webpackDashboardAck: true
      })
    }
  }

  // Init data
  if (typeof getSharedData('serve-status') === 'undefined') {
    for (const key of ['serve', 'build']) {
      resetSharedData(key)
    }
  }

  // Tasks
  api.describeTask({
    match: /vue-cli-service serve/,
    description: 'Compiles and hot-reloads for development',
    link: 'https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#serve',
    prompts: [
      {
        name: 'open',
        type: 'confirm',
        default: false,
        description: 'Open browser on server start'
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
          }
        ],
        description: 'Specify env mode'
      },
      {
        name: 'host',
        type: 'input',
        default: '0.0.0.0',
        description: 'Specify host'
      },
      {
        name: 'port',
        type: 'input',
        default: 8080,
        description: 'Specify port'
      },
      {
        name: 'https',
        type: 'confirm',
        default: false,
        description: 'Use HTTPS'
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
      resetSharedData('serve')
    },
    onRun: () => {
      api.ipcOn(onWebpackMessage)
    },
    onExit: () => {
      api.ipcOff(onWebpackMessage)
    },
    views: [
      {
        id: 'vue-webpack-dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        component: 'vue-webpack-dashboard'
      }
    ],
    defaultView: 'vue-webpack-dashboard'
  })
  api.describeTask({
    match: /vue-cli-service build/,
    description: 'Compiles and minifies for production',
    link: 'https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#build',
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
          }
        ],
        description: 'Specify env mode'
      },
      {
        name: 'dest',
        type: 'input',
        default: 'dist',
        description: 'Output directory'
      },
      {
        name: 'target',
        type: 'list',
        default: 'app',
        choices: [
          {
            name: 'Web app',
            value: 'app'
          },
          {
            name: 'Library',
            value: 'lib'
          },
          {
            name: 'Web component',
            value: 'wc'
          },
          {
            name: 'Async web component',
            value: 'wc-async'
          }
        ],
        description: 'Build target'
      },
      {
        name: 'name',
        type: 'input',
        default: '',
        description: 'Name for library or web-component mode (default: "name" in package.json or entry filename)'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      // Args
      if (answers.mode) args.push('--mode', answers.mode)
      if (answers.dest) args.push('--dest', answers.dest)
      if (answers.target) args.push('--target', answers.target)
      if (answers.name) args.push('--port', answers.name)
      args.push('--dashboard')

      // Data
      resetSharedData('build')
    },
    onRun: () => {
      api.ipcOn(onWebpackMessage)
    },
    onExit: () => {
      api.ipcOff(onWebpackMessage)
    },
    views: [
      {
        id: 'vue-webpack-dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        component: 'vue-webpack-dashboard'
      }
    ],
    defaultView: 'vue-webpack-dashboard'
  })

  // Testing client addon
  api.addClientAddon({
    id: 'vue-webpack',
    path: '@vue/cli-ui-addon-webpack/dist'
  })
}
