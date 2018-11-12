const path = require('path')
// Connectors
const logs = require('../connectors/logs')
const sharedData = require('../connectors/shared-data')
const views = require('../connectors/views')
const suggestions = require('../connectors/suggestions')
const folders = require('../connectors/folders')
const progress = require('../connectors/progress')
const app = require('../connectors/app')
// Utils
const ipc = require('../util/ipc')
const { notify } = require('../util/notification')
const { matchesPluginId } = require('@vue/cli-shared-utils')
const { log } = require('../util/logger')
// Validators
const { validateConfiguration } = require('./configuration')
const { validateDescribeTask, validateAddTask } = require('./task')
const { validateClientAddon } = require('./client-addon')
const { validateView, validateBadge } = require('./view')
const { validateNotify } = require('./notify')
const { validateSuggestion } = require('./suggestion')
const { validateProgress } = require('./progress')
const { validateWidget } = require('./widget')

class PluginApi {
  constructor ({ plugins, file, project, lightMode = false }, context) {
    // Context
    this.context = context
    this.pluginId = null
    this.project = project
    this.plugins = plugins
    this.cwd = file
    this.lightMode = lightMode
    // Hooks
    this.hooks = {
      projectOpen: [],
      pluginReload: [],
      configRead: [],
      configWrite: [],
      taskRun: [],
      taskExit: [],
      taskOpen: [],
      viewOpen: []
    }
    // Data
    this.configurations = []
    this.describedTasks = []
    this.addedTasks = []
    this.clientAddons = []
    this.views = []
    this.actions = new Map()
    this.ipcHandlers = []
    this.widgetDefs = []
  }

  /**
   * Register an handler called when the project is open (only if this plugin is loaded).
   *
   * @param {function} cb Handler
   */
  onProjectOpen (cb) {
    if (this.lightMode) return
    if (this.project) {
      cb(this.project)
      return
    }
    this.hooks.projectOpen.push(cb)
  }

  /**
   * Register an handler called when the plugin is reloaded.
   *
   * @param {function} cb Handler
   */
  onPluginReload (cb) {
    if (this.lightMode) return
    this.hooks.pluginReload.push(cb)
  }

  /**
   * Register an handler called when a config is red.
   *
   * @param {function} cb Handler
   */
  onConfigRead (cb) {
    if (this.lightMode) return
    this.hooks.configRead.push(cb)
  }

  /**
   * Register an handler called when a config is written.
   *
   * @param {function} cb Handler
   */
  onConfigWrite (cb) {
    if (this.lightMode) return
    this.hooks.configWrite.push(cb)
  }

  /**
   * Register an handler called when a task is run.
   *
   * @param {function} cb Handler
   */
  onTaskRun (cb) {
    if (this.lightMode) return
    this.hooks.taskRun.push(cb)
  }

  /**
   * Register an handler called when a task has exited.
   *
   * @param {function} cb Handler
   */
  onTaskExit (cb) {
    if (this.lightMode) return
    this.hooks.taskExit.push(cb)
  }

  /**
   * Register an handler called when the user opens one task details.
   *
   * @param {function} cb Handler
   */
  onTaskOpen (cb) {
    if (this.lightMode) return
    this.hooks.taskOpen.push(cb)
  }

  /**
   * Register an handler called when a view is open.
   *
   * @param {function} cb Handler
   */
  onViewOpen (cb) {
    if (this.lightMode) return
    this.hooks.viewOpen.push(cb)
  }

  /**
   * Describe a project configuration (usually for config file like `.eslintrc.json`).
   *
   * @param {object} options Configuration description
   */
  describeConfig (options) {
    if (this.lightMode) return
    try {
      validateConfiguration(options)
      this.configurations.push({
        ...options,
        pluginId: this.pluginId
      })
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
      this.describedTasks.push({
        ...options,
        pluginId: this.pluginId
      })
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
      options => typeof options.match === 'function' ? options.match(command) : options.match.test(command)
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
      this.addedTasks.push({
        ...options,
        pluginId: this.pluginId
      })
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
    if (this.lightMode) return
    try {
      validateClientAddon(options)
      if (options.url && options.path) {
        throw new Error(`'url' and 'path' can't be defined at the same time.`)
      }
      this.clientAddons.push({
        ...options,
        pluginId: this.pluginId
      })
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
    if (this.lightMode) return
    try {
      validateView(options)
      this.views.push({
        ...options,
        pluginId: this.pluginId
      })
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
    if (this.lightMode) return
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
    const handler = cb._handler = ({ data, emit }) => {
      if (data._projectId) {
        if (data._projectId === this.project.id) {
          data = data._data
        } else {
          return
        }
      }
      // eslint-disable-next-line standard/no-callback-literal
      cb({ data, emit })
    }
    this.ipcHandlers.push(handler)
    return ipc.on(handler)
  }

  /**
   * Remove a listener for IPC messages.
   *
   * @param {any} cb Callback to be removed
   */
  ipcOff (cb) {
    const handler = cb._handler
    if (!handler) return
    const index = this.ipcHandlers.indexOf(handler)
    if (index !== -1) this.ipcHandlers.splice(index, 1)
    ipc.off(handler)
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

  /**
   * Display a notification in the user OS
   * @param {object} options Notification options
   */
  notify (options) {
    try {
      validateNotify(options)
      notify(options)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'notify' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  /**
   * Indicates if a specific plugin is used by the project
   * @param {string} id Plugin id or short id
   */
  hasPlugin (id) {
    if (id === 'router') id = 'vue-router'
    if (['vue-router', 'vuex'].includes(id)) {
      const pkg = folders.readPackage(this.cwd, this.context, true)
      return ((pkg.dependencies && pkg.dependencies[id]) || (pkg.devDependencies && pkg.devDependencies[id]))
    }
    return this.plugins.some(p => matchesPluginId(id, p.id))
  }

  /**
   * Display the progress screen.
   *
   * @param {object} options Progress options
   */
  setProgress (options) {
    if (this.lightMode) return
    try {
      validateProgress(options)
      progress.set({
        ...options,
        id: '__plugins__'
      }, this.context)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'setProgress' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  /**
   * Remove the progress screen.
   */
  removeProgress () {
    progress.remove('__plugins__', this.context)
  }

  /**
   * Get current working directory.
   */
  getCwd () {
    return this.cwd
  }

  /**
   * Resolves a file relative to current working directory
   * @param {string} file Path to file relative to project
   */
  resolve (file) {
    return path.resolve(this.cwd, file)
  }

  /**
   * Get currently open project
   */
  getProject () {
    return this.project
  }

  /* Namespaced */

  /**
   * Retrieve a Shared data value.
   *
   * @param {string} id Id of the Shared data
   * @returns {any} Shared data value
   */
  getSharedData (id) {
    return sharedData.get({ id, projectId: this.project.id }, this.context)
  }

  /**
   * Set or update the value of a Shared data
   *
   * @param {string} id Id of the Shared data
   * @param {any} value Value of the Shared data
   */
  setSharedData (id, value) {
    sharedData.set({ id, projectId: this.project.id, value }, this.context)
  }

  /**
   * Delete a shared data.
   *
   * @param {string} id Id of the Shared data
   */
  removeSharedData (id) {
    sharedData.remove({ id, projectId: this.project.id }, this.context)
  }

  /**
   * Watch for a value change of a shared data
   *
   * @param {string} id Id of the Shared data
   * @param {function} handler Callback
   */
  watchSharedData (id, handler) {
    sharedData.watch({ id, projectId: this.project.id }, handler)
  }

  /**
   * Delete the watcher of a shared data.
   *
   * @param {string} id Id of the Shared data
   * @param {function} handler Callback
   */
  unwatchSharedData (id, handler) {
    sharedData.unwatch({ id, projectId: this.project.id }, handler)
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
    log('Storage set', id, value)
    this.db.set(id, value).write()
  }

  /**
   * Add a suggestion for the user.
   *
   * @param {object} options Suggestion
   */
  addSuggestion (options) {
    if (this.lightMode) return
    try {
      validateSuggestion(options)
      suggestions.add(options, this.context)
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'addSuggestion' options are invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid options: ${e.message}`))
    }
  }

  /**
   * Remove a suggestion
   *
   * @param {string} id Id of the suggestion
   */
  removeSuggestion (id) {
    suggestions.remove(id, this.context)
  }

  /**
   * Register a widget for project dashboard
   *
   * @param {object} def Widget definition
   */
  registerWidget (def) {
    if (this.lightMode) return
    try {
      validateWidget(def)
      this.widgetDefs.push({
        ...def,
        pluginId: this.pluginId
      })
    } catch (e) {
      logs.add({
        type: 'error',
        tag: 'PluginApi',
        message: `(${this.pluginId || 'unknown plugin'}) 'registerWidget' widget definition is invalid\n${e.message}`
      }, this.context)
      console.error(new Error(`Invalid definition: ${e.message}`))
    }
  }

  /**
   * Request a route to be displayed in the client
   */
  requestRoute (route) {
    app.requestRoute(route, this.context)
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
      storageSet: (id, value) => this.storageSet(namespace + id, value),
      addSuggestion: (options) => {
        options.id = namespace + options.id
        return this.addSuggestion(options)
      },
      removeSuggestion: (id) => this.removeSuggestion(namespace + id),
      registerWidget: (def) => {
        def.id = namespace + def.id
        return this.registerWidget(def)
      }
    }
  }
}

module.exports = PluginApi
