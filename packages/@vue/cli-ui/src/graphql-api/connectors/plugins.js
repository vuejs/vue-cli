const path = require('path')
const fs = require('fs')
const LRU = require('lru-cache')
const semver = require('semver')
const {
  isPlugin,
  isOfficialPlugin,
  getPluginLink
} = require('@vue/cli-shared-utils')
const getPackageVersion = require('@vue/cli/lib/util/getPackageVersion')
const { resolveModule, loadModule } = require('@vue/cli/lib/util/module')
const {
  progress: installProgress,
  installPackage,
  uninstallPackage,
  updatePackage
} = require('@vue/cli/lib/util/installDeps')
const invoke = require('@vue/cli/lib/invoke')
const notifier = require('node-notifier')
// Subs
const channels = require('../channels')
// Connectors
const cwd = require('./cwd')
const folders = require('./folders')
const prompts = require('./prompts')
const progress = require('./progress')
const logs = require('./logs')
const clientAddons = require('./client-addons')
const views = require('./views')
const locales = require('./locales')
const sharedData = require('./shared-data')
// Api
const PluginApi = require('../api/PluginApi')
// Utils
const { getCommand } = require('../utils/command')
const { resolveModuleRoot } = require('../utils/resolve-path')
const ipc = require('../utils/ipc')
const { log } = require('../utils/logger')

const PROGRESS_ID = 'plugin-installation'

// Caches
const metadataCache = new LRU({
  max: 200,
  maxAge: 1000 * 60 * 30
})
const logoCache = new LRU({
  max: 50
})

// Local
let currentPluginId
let eventsInstalled = false
let plugins = []
let pluginApi
let installationStep
let projectId

function getPath (id) {
  return resolveModuleRoot(resolveModule(id, cwd.get()), id)
}

function findPlugins (deps) {
  return Object.keys(deps).filter(
    key => isPlugin(key)
  ).map(
    id => ({
      id,
      versionRange: deps[id],
      official: isOfficialPlugin(id),
      installed: fs.existsSync(getPath(id)),
      website: getPluginLink(id)
    })
  )
}

function list (file, context) {
  const pkg = folders.readPackage(file, context)
  plugins = []
  plugins = plugins.concat(findPlugins(pkg.dependencies || {}))
  plugins = plugins.concat(findPlugins(pkg.devDependencies || {}))
  resetPluginApi(context)
  return plugins
}

function resetPluginApi (context) {
  // Clean up
  if (pluginApi) {
    pluginApi.views.forEach(r => views.remove(r.id, context))
    pluginApi.ipcHandlers.forEach(fn => ipc.off(fn))
  }
  sharedData.unWatchAll()

  pluginApi = new PluginApi(context)
  // Run Plugin API
  runPluginApi('@vue/cli-service', context)
  plugins.forEach(plugin => runPluginApi(plugin.id, context))
  runPluginApi(cwd.get(), context, 'vue-cli-ui')
  // Add client addons
  pluginApi.clientAddons.forEach(options => clientAddons.add(options, context))
  // Add views
  pluginApi.views.forEach(view => views.add(view, context))

  setTimeout(() => {
    const projects = require('./projects')
    const project = projects.getCurrent(context)
    if (!project) return
    if (projectId !== project.id) {
      projectId = project.id
      log('Hook onProjectOpen', pluginApi.projectOpenHooks.length, 'handlers')
      pluginApi.projectOpenHooks.forEach(fn => fn(project, projects.getLast(context)))
      pluginApi.project = project
    } else {
      log('Hook onPluginReload', pluginApi.pluginReloadHooks.length, 'handlers')
      pluginApi.pluginReloadHooks.forEach(fn => fn(project))
    }
  })
}

function runPluginApi (id, context, fileName = 'ui') {
  let module
  try {
    module = loadModule(`${id}/${fileName}`, cwd.get(), true)
  } catch (e) {}
  if (module) {
    pluginApi.pluginId = id
    module(pluginApi)
    log('Plugin API loaded for', id)
    pluginApi.pluginId = null
  }

  // Locales
  try {
    const folder = fs.existsSync(id) ? id : getPath(id)
    locales.loadFolder(folder, context)
  } catch (e) {}
}

function findOne (id, context) {
  return plugins.find(
    p => p.id === id
  )
}

function readPackage (id, context) {
  return folders.readPackage(getPath(id), context)
}

async function getMetadata (id, context) {
  let metadata = metadataCache.get(id)
  if (metadata) {
    return metadata
  }

  const res = await getPackageVersion(id)
  if (res.statusCode === 200) {
    metadata = res.body
  }

  if (metadata) {
    metadataCache.set(id, metadata)
    return metadata
  }
}

async function getVersion ({ id, installed, versionRange }, context) {
  let current
  if (installed) {
    const pkg = readPackage(id, context)
    current = pkg.version
  } else {
    current = null
  }
  let latest, wanted
  const metadata = await getMetadata(id, context)
  if (metadata) {
    latest = metadata['dist-tags'].latest

    const versions = Object.keys(metadata.versions)
    wanted = semver.maxSatisfying(versions, versionRange)
  }

  if (!latest) latest = current
  if (!wanted) wanted = current

  return {
    current,
    latest,
    wanted,
    range: versionRange
  }
}

async function getDescription ({ id }, context) {
  const metadata = await getMetadata(id, context)
  if (metadata) {
    return metadata.description
  }
  return null
}

async function getLogo ({ id }, context) {
  const cached = logoCache.get(id)
  if (cached) {
    return `data:image/png;base64,${cached}`
  }
  const folder = getPath(id)
  const file = path.join(folder, 'logo.png')
  if (fs.existsSync(file)) {
    const data = fs.readFileSync(file, { encoding: 'base64' })
    logoCache.set(id, data)
    return `data:image/png;base64,${data}`
  }
  return null
}

function getInstallation (context) {
  if (!eventsInstalled) {
    eventsInstalled = true

    // Package installation progress events
    installProgress.on('progress', value => {
      if (progress.get(PROGRESS_ID)) {
        progress.set({ id: PROGRESS_ID, progress: value }, context)
      }
    })
    installProgress.on('log', message => {
      if (progress.get(PROGRESS_ID)) {
        progress.set({ id: PROGRESS_ID, info: message }, context)
      }
    })
  }

  return {
    id: 'plugin-install',
    pluginId: currentPluginId,
    step: installationStep,
    prompts: prompts.list()
  }
}

function install (id, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'plugin-install',
      args: [id]
    })
    currentPluginId = id
    installationStep = 'install'
    if (process.env.VUE_CLI_DEBUG && isOfficialPlugin(id)) {
      mockInstall(id, context)
    } else {
      await installPackage(cwd.get(), getCommand(), null, id)
    }
    await initPrompts(id, context)
    installationStep = 'config'

    notifier.notify({
      title: `Plugin installed`,
      message: `Plugin ${id} installed, next step is configuration`,
      icon: path.resolve(__dirname, '../../assets/done.png')
    })

    return getInstallation(context)
  })
}

function mockInstall (id, context) {
  const pkg = folders.readPackage(cwd.get(), context, true)
  pkg.devDependencies[id] = '*'
  folders.writePackage({ file: cwd.get(), data: pkg }, context)
  return true
}

function uninstall (id, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'plugin-uninstall',
      args: [id]
    })
    installationStep = 'uninstall'
    currentPluginId = id
    if (process.env.VUE_CLI_DEBUG && isOfficialPlugin(id)) {
      mockUninstall(id, context)
    } else {
      await uninstallPackage(cwd.get(), getCommand(), null, id)
    }
    currentPluginId = null
    installationStep = null

    notifier.notify({
      title: `Plugin uninstalled`,
      message: `Plugin ${id} uninstalled`,
      icon: path.resolve(__dirname, '../../assets/done.png')
    })

    return getInstallation(context)
  })
}

function mockUninstall (id, context) {
  const pkg = folders.readPackage(cwd.get(), context, true)
  delete pkg.devDependencies[id]
  folders.writePackage({ file: cwd.get(), data: pkg }, context)
  return true
}

function runInvoke (id, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'plugin-invoke',
      args: [id]
    })
    currentPluginId = id
    // Allow plugins that don't have a generator
    if (resolveModule(`${id}/generator`, cwd.get())) {
      await invoke(id, prompts.getAnswers(), cwd.get())
    }
    // Run plugin api
    runPluginApi(id, context)
    installationStep = 'diff'

    notifier.notify({
      title: `Plugin invoke sucess`,
      message: `Plugin ${id} invoked successfully`,
      icon: path.resolve(__dirname, '../../assets/done.png')
    })

    return getInstallation(context)
  })
}

function finishInstall (context) {
  installationStep = null
  currentPluginId = null
  return getInstallation(context)
}

async function initPrompts (id, context) {
  await prompts.reset()
  try {
    let data = require(path.join(getPath(id), 'prompts.js'))
    if (typeof data === 'function') {
      data = await data()
    }
    data.forEach(prompts.add)
  } catch (e) {
    console.warn(`No prompts found for ${id}`)
  }
  await prompts.start()
}

function update (id, context) {
  return progress.wrap('plugin-update', context, async setProgress => {
    setProgress({
      status: 'plugin-update',
      args: [id]
    })
    currentPluginId = id
    const plugin = findOne(id, context)
    const { current, wanted } = await getVersion(plugin, context)
    await updatePackage(cwd.get(), getCommand(), null, id)
    resetPluginApi(context)
    logs.add({
      message: `Plugin ${id} updated from ${current} to ${wanted}`,
      type: 'info'
    }, context)
    currentPluginId = null
    return findOne(id)
  })
}

function getApi () {
  return pluginApi
}

async function callAction ({ id, params }, context) {
  context.pubsub.publish(channels.PLUGIN_ACTION_CALLED, {
    pluginActionCalled: { id, params }
  })
  log('PluginAction called', id, params)
  const results = []
  const errors = []
  const list = pluginApi.actions.get(id)
  if (list) {
    for (const cb of list) {
      let result = null
      let error = null
      try {
        result = await cb(params)
      } catch (e) {
        error = e
      }
      results.push(result)
      errors.push(error)
    }
  }
  context.pubsub.publish(channels.PLUGIN_ACTION_RESOLVED, {
    pluginActionResolved: { id, params, results, errors }
  })
  log('PluginAction resolved', id, params, 'results:', results, 'errors:', errors)
  return { id, params, results, errors }
}

function serve (req, res) {
  const { id, 0: file } = req.params
  const basePath = id === '.' ? cwd.get() : getPath(id)
  if (basePath) {
    res.sendFile(path.join(basePath, 'ui-public', file))
    return
  }

  res.status(404)
  res.send(`Addon ${id} not found in loaded addons. Try opening a vue-cli project first?`)
}

module.exports = {
  list,
  findOne,
  getVersion,
  getDescription,
  getLogo,
  getInstallation,
  install,
  uninstall,
  update,
  runInvoke,
  resetPluginApi,
  getApi,
  finishInstall,
  callAction,
  serve
}
