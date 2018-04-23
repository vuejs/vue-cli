// Connectors
const logs = require('../connectors/logs')
const sharedData = require('../connectors/shared-data')
const views = require('../connectors/views')
// Utils
const ipc = require('../utils/ipc')
// Validators
const { validateConfiguration } = require('./configuration')
const { validateTask } = require('./task')
const { validateClientAddon } = require('./client-addon')
const { validateView, validateBadge } = require('./view')

class PluginApi {
  constructor (context) {
    // Context
    this.context = context
    this.pluginId = null
    // Data
    this.configurations = []
    this.tasks = []
    this.clientAddons = []
    this.views = []
    this.actions = new Map()
  }

  /**
   * Describe a project configuration (usually for config file like `.eslintrc.json`).
   *
   * @param {object} options Configuration description
   */
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

  /**
   * Describe a project task with additional information.
   * The tasks are generated from the scripts in the project `package.json`.
   *
   * @param {object} options Task description
   */
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

  /**
   * Get the task description matching a script command.
   *
   * @param {string} command Npm script command from `package.json`
   * @returns {object} Task description
   */
  getTask (command) {
    return this.tasks.find(
      options => options.match.test(command)
    )
  }

  /**
   * Register a client addon (a JS bundle which will be loaded in the browser).
   * Used to load components and add vue-router routes.
   *
   * @param {object} options Client addon options
   *   {
   *     id: string,
   *     url: string
   *   }
   *   or
   *   {
   *     id: string,
   *     path: string
   *   }
   */
  addClientAddon (options) {
    try {
      validateClientAddon(options)
      if (options.url && options.path) {
        throw new Error(`'url' and 'path' can't be defined at the same time.`)
      }
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

  /* Project view */

  /**
   * Add a new project view below the builtin 'plugins', 'config' and 'tasks' ones.
   *
   * @param {object} options ProjectView options
   */
  addView (options) {
    try {
      validateView(options)
      this.views.push(options)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'addView' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  /**
   * Add a badge to the project view button.
   * If the badge already exists, add 1 to the counter.
   *
   * @param {string} viewId Project view id
   * @param {object} options Badge options
   */
  addViewBadge (viewId, options) {
    try {
      validateBadge(options)
      views.addBadge({ viewId, badge: options }, this.context)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'addViewBadge' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  /**
   * Remove 1 from the counter of a badge if it exists.
   * If the badge counter reaches 0, it is removed from the button.
   *
   * @param {any} viewId
   * @param {any} badgeId
   * @memberof PluginApi
   */
  removeViewBadge (viewId, badgeId) {
    views.removeBadge({ viewId, badgeId }, this.context)
  }

  /* IPC */

  /**
   * Add a listener to the IPC messages.
   *
   * @param {function} cb Callback with 'data' param
   */
  ipcOn (cb) {
    return ipc.on(cb)
  }

  /**
   * Remove a listener for IPC messages.
   *
   * @param {any} cb Callback to be removed
   */
  ipcOff (cb) {
    ipc.off(cb)
  }

  /**
   * Send an IPC message to all connected IPC clients.
   *
   * @param {any} data Message data
   */
  ipcSend (data) {
    ipc.send(data)
  }

  /* Namespaced */

  /**
   * Retrieve a Shared data value.
   *
   * @param {string} id Id of the Shared data
   * @returns {any} Shared data value
   */
  getSharedData (id) {
    return sharedData.get(id, this.context)
  }

  /**
   * Set or update the value of a Shared data
   *
   * @param {string} id Id of the Shared data
   * @param {any} value Value of the Shared data
   */
  setSharedData (id, value) {
    sharedData.set({ id, value }, this.context)
  }

  /**
   * Listener triggered when a Plugin action is called from a client addon component.
   *
   * @param {string} id Id of the action to listen
   * @param {any} cb Callback (ex: (params) => {} )
   */
  onAction (id, cb) {
    let list = this.actions.get(id)
    if (!list) {
      list = []
      this.actions.set(id, list)
    }
    list.push(cb)
  }

  /**
   * Call a Plugin action. This can also listened by client addon components.
   *
   * @param {string} id Id of the action
   * @param {object} params Params object passed as 1st argument to callbacks
   * @returns {Promise}
   */
  callAction (id, params) {
    const plugins = require('../connectors/plugins')
    return plugins.callAction({ id, params }, this.context)
  }

  /**
   * Create a namespaced version of:
   *   - getSharedData
   *   - setSharedData
   *   - onAction
   *   - callAction
   *
   * @param {string} namespace Prefix to add to the id params
   * @returns {object} Namespaced methods
   */
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
