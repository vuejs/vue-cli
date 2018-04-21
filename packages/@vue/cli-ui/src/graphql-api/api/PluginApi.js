// Connectors
const logs = require('../connectors/logs')
const plugins = require('../connectors/plugins')
const sharedData = require('../connectors/shared-data')
const routes = require('../connectors/routes')
// Utils
const ipc = require('../utils/ipc')
// Validators
const { validateConfiguration } = require('./configuration')
const { validateTask } = require('./task')
const { validateClientAddon } = require('./client-addon')
const { validateRoute, validateBadge } = require('./route')

class PluginApi {
  constructor (context) {
    this.context = context
    this.pluginId = null
    // Data
    this.configurations = []
    this.tasks = []
    this.clientAddons = []
    this.routes = []
    this.actions = new Map()
  }

  describeConfig (options) {
    try {
      validateConfiguration(options)
      this.configurations.push(options)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'describeConfig' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  describeTask (options) {
    try {
      validateTask(options)
      this.tasks.push(options)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'describeTask' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  getTask (command) {
    return this.tasks.find(
      options => options.match.test(command)
    )
  }

  addClientAddon (options) {
    try {
      validateClientAddon(options)
      this.clientAddons.push(options)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'addClientAddon' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  /* Routes */

  addRoute (options) {
    try {
      validateRoute(options)
      this.routes.push(options)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'addRoute' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  addRouteBadge (routeId, options) {
    try {
      validateBadge(options)
      routes.addBadge({ routeId, badge: options }, this.context)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'addRouteBadge' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  removeRouteBadge (routeId, badgeId) {
    routes.removeBadge({ routeId, badgeId }, this.context)
  }

  /* IPC */

  ipcOn (cb) {
    return ipc.on(cb)
  }

  ipcOff (cb) {
    ipc.off(cb)
  }

  ipcSend (data) {
    ipc.send(data)
  }

  /* Namespaced */

  getSharedData (id) {
    return sharedData.get(id, this.context)
  }

  setSharedData (id, value) {
    sharedData.set({ id, value }, this.context)
  }

  onAction (id, cb) {
    let list = this.actions.get(id)
    if (!list) {
      list = []
      this.actions.set(id, list)
    }
    list.push(cb)
  }

  callAction (id, params) {
    return plugins.callAction({ id, params }, this.context)
  }

  namespace (namespace) {
    return {
      getSharedData: (id) => this.getSharedData(namespace + id),
      setSharedData: (id, value) => this.setSharedData(namespace + id, value),
      onAction: (id, cb) => this.onAction(namespace + id, cb),
      callAction: (id, params) => this.callAction(namespace + id, params)
    }
  }
}

module.exports = PluginApi
