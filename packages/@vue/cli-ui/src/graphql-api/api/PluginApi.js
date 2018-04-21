const logs = require('../connectors/logs')
const plugins = require('../connectors/plugins')
const sharedData = require('../connectors/shared-data')
const ipc = require('../utils/ipc')
const { validate: validateConfig } = require('./configuration')
const { validate: validateTask } = require('./task')
const { validate: validateClientAddon } = require('./client-addon')

class PluginApi {
  constructor (context) {
    this.context = context
    this.configurations = []
    this.tasks = []
    this.clientAddons = []
    this.actions = new Map()
    this.pluginId = null
  }

  describeConfig (options) {
    try {
      validateConfig(options)
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
