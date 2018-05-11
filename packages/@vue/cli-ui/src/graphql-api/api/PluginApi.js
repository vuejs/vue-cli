// Connectors
const logs = require('../connectors/logs')
const sharedData = require('../connectors/shared-data')
const views = require('../connectors/views')
// Utils
const ipc = require('../utils/ipc')
// Validators
const { validateConfiguration } = require('./configuration')
const { validateDescribeTask, validateAddTask } = require('./task')
const { validateClientAddon } = require('./client-addon')
const { validateView, validateBadge } = require('./view')

class PluginApi {
  constructor (context) {
    // Context
    this.context = context
    this.pluginId = null
    this.project = null
    // Hooks
    this.projectOpenHooks = []
    this.pluginReloadHooks = []
    // Data
    this.configurations = []
    this.describedTasks = []
    this.addedTasks = []
    this.clientAddons = []
    this.views = []
    this.actions = new Map()
    this.ipcHandlers = []
  }

  /**
   * Register an handler called when the project is open (only if this plugin is loaded).
   *
   * @param {function} cb Handler
   */
  onProjectOpen (cb) {
    if (this.project) {
      cb(this.project)
      return
    }
    this.projectOpenHooks.push(cb)
  }

  /**
   * Register an handler called when the plugin is reloaded.
   *
   * @param {function} cb Handler
   */
  onPluginReload (cb) {
    this.pluginReloadHooks.push(cb)
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
      validateDescribeTask(options)
      this.describedTasks.push(options)
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
  getDescribedTask (command) {
    return this.describedTasks.find(
      options => options.match.test(command)
    )
  }

  /**
   * Add a new task indepently from the scripts.
   * The task will only appear in the UI.
   *
   * @param {object} options Task description
   */
  addTask (options) {
    try {
      validateAddTask(options)
      this.addedTasks.push(options)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'addTask' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
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
    this.ipcHandlers.push(cb)
    return ipc.on(cb)
  }

  /**
   * Remove a listener for IPC messages.
   *
   * @param {any} cb Callback to be removed
   */
  ipcOff (cb) {
    const index = this.ipcHandlers.indexOf(cb)
    if (index !== -1) this.ipcHandlers.splice(index, 1)
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

  /**
   * Get the local DB instance (lowdb)
   *
   * @readonly
   */
  get db () {
    return this.context.db
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
   * Delete a shared data.
   *
   * @param {string} id Id of the Shared data
   */
  removeSharedData (id) {
    sharedData.remove(id, this.context)
  }

  /**
   * Watch for a value change of a shared data
   *
   * @param {string} id Id of the Shared data
   * @param {function} handler Callback
   */
  watchSharedData (id, handler) {
    sharedData.watch(id, handler)
  }

  /**
   * Delete the watcher of a shared data.
   *
   * @param {string} id Id of the Shared data
   * @param {function} handler Callback
   */
  unwatchSharedData (id, handler) {
    sharedData.unwatch(id, handler)
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
   * Retrieve a value from the local DB
   *
   * @param {string} id Path to the item
   * @returns Item value
   */
  storageGet (id) {
    return this.db.get(id).value()
  }

  /**
   * Store a value into the local DB
   *
   * @param {string} id Path to the item
   * @param {any} value Value to be stored (must be serializable in JSON)
   */
  storageSet (id, value) {
    this.db.set(id, value).write()
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
      removeSharedData: (id) => this.removeSharedData(namespace + id),
      watchSharedData: (id, handler) => this.watchSharedData(namespace + id, handler),
      unwatchSharedData: (id, handler) => this.unwatchSharedData(namespace + id, handler),
      onAction: (id, cb) => this.onAction(namespace + id, cb),
      callAction: (id, params) => this.callAction(namespace + id, params),
      storageGet: (id) => this.storageGet(namespace + id),
      storageSet: (id, value) => this.storageSet(namespace + id, value)
    }
  }
}

module.exports = PluginApi
