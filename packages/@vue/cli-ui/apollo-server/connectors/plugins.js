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
const { resolveModule, loadModule, clearModule } = require('@vue/cli/lib/util/module')
const {
  progress: installProgress,
  installPackage,
  uninstallPackage,
  updatePackage
} = require('@vue/cli/lib/util/installDeps')
const invoke = require('@vue/cli/lib/invoke')
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
const suggestions = require('./suggestions')
// Api
const PluginApi = require('../api/PluginApi')
// Utils
const { getCommand } = require('../util/command')
const { resolveModuleRoot } = require('../util/resolve-path')
const ipc = require('../util/ipc')
const { log } = require('../util/logger')
const { notify } = require('../util/notification')

const PROGRESS_ID = 'plugin-installation'
const CLI_SERVICE = '@vue/cli-service'

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
    id => isPlugin(id) || id === CLI_SERVICE
  ).map(
    id => ({
      id,
      versionRange: deps[id],
      official: isOfficialPlugin(id) || id === CLI_SERVICE,
      installed: fs.existsSync(getPath(id)),
      website: getPluginLink(id)
    })
  )
}

function list (file, context, resetApi = true) {
  const pkg = folders.readPackage(file, context)
  plugins = []
  plugins = plugins.concat(findPlugins(pkg.devDependencies || {}))
  plugins = plugins.concat(findPlugins(pkg.dependencies || {}))

  // Put cli service at the top
  const index = plugins.findIndex(p => p.id === CLI_SERVICE)
  if (index !== -1) {
    const service = plugins[index]
    plugins.splice(index, 1)
    plugins.unshift(service)
  }

  if (resetApi) resetPluginApi(context)
  return plugins
}

function resetPluginApi (context) {
  // Clean up
  if (pluginApi) {
    pluginApi.views.forEach(r => views.remove(r.id, context))
    pluginApi.ipcHandlers.forEach(fn => ipc.off(fn))
  }
  sharedData.unWatchAll()

  clientAddons.clear(context)
  suggestions.clear(context)

  setTimeout(() => {
    const projects = require('./projects')
    const project = projects.getCurrent(context)

    pluginApi = new PluginApi({
      plugins
    }, context)

    if (projects.getType(project) !== 'vue') return

    // Run Plugin API
    runPluginApi(path.resolve(__dirname, '../../'), context, 'ui-defaults')
    plugins.forEach(plugin => runPluginApi(plugin.id, context))
    runPluginApi(cwd.get(), context, 'vue-cli-ui')
    // Add client addons
    pluginApi.clientAddons.forEach(options => clientAddons.add(options, context))
    // Add views
    pluginApi.views.forEach(view => views.add(view, context))

    if (!project) return
    projectId = project.id
    pluginApi.project = project
    if (projectId !== project.id) {
      callHook('projectOpen', [project, projects.getLast(context)], context)
    } else {
      callHook('pluginReload', [project], context)

      // View open hook
      const currentView = views.getCurrent()
      if (currentView) views.open(currentView.id)
    }
  })

  return true
}

function runPluginApi (id, context, fileName = 'ui') {
  let module
  try {
    module = loadModule(`${id}/${fileName}`, cwd.get(), true)
  } catch (e) {
    if (process.env.VUE_CLI_DEBUG) {
      console.error(e)
    }
  }
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

function callHook (id, args, context) {
  const fns = pluginApi.hooks[id]
  log(`Hook ${id}`, fns.length, 'handlers')
  fns.forEach(fn => fn(...args))
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
    return cached
  }
  const folder = getPath(id)
  const file = path.join(folder, 'logo.png')
  if (fs.existsSync(file)) {
    const data = `/_plugin-logo/${encodeURIComponent(id)}`
    logoCache.set(id, data)
    return data
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

    notify({
      title: `Plugin installed`,
      message: `Plugin ${id} installed, next step is configuration`,
      icon: 'done'
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

    notify({
      title: `Plugin uninstalled`,
      message: `Plugin ${id} uninstalled`,
      icon: 'done'
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

    clearModule('@vue/cli-service/webpack.config.js', cwd.get())

    currentPluginId = id
    // Allow plugins that don't have a generator
    if (resolveModule(`${id}/generator`, cwd.get())) {
      await invoke(id, prompts.getAnswers(), cwd.get())
    }
    // Run plugin api
    runPluginApi(id, context)
    installationStep = 'diff'

    notify({
      title: `Plugin invoke sucess`,
      message: `Plugin ${id} invoked successfully`,
      icon: 'done'
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
    let data = require(path.join(getPath(id), 'prompts'))
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

    notify({
      title: `Plugin updated`,
      message: `Plugin ${id} was successfully updated`,
      icon: 'done'
    })
    resetPluginApi(context)

    currentPluginId = null
    return findOne(id)
  })
}

async function updateAll (context) {
  return progress.wrap('plugins-update', context, async setProgress => {
    const plugins = await list(cwd.get(), context, false)
    let updatedPlugins = []
    for (const plugin of plugins) {
      const version = await getVersion(plugin, context)
      if (version.current !== version.wanted) {
        updatedPlugins.push(plugin)
      }
    }

    if (!updatedPlugins.length) {
      notify({
        title: `No updates available`,
        message: `No plugin to update in the version ranges declared in package.json`,
        icon: 'done'
      })
      return []
    }

    setProgress({
      status: 'plugins-update',
      args: [updatedPlugins.length]
    })

    await updatePackage(cwd.get(), getCommand(), null, updatedPlugins.map(
      p => p.id
    ).join(' '))

    notify({
      title: `Plugins updated`,
      message: `${updatedPlugins.length} plugin(s) were successfully updated`,
      icon: 'done'
    })
    resetPluginApi(context)

    return updatedPlugins
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

function serveFile (projectId, file, res) {
  const basePath = projectId === '.' ? cwd.get() : getPath(decodeURIComponent(projectId))
  if (basePath) {
    res.sendFile(path.join(basePath, file))
    return
  }

  res.status(404)
  res.send(`Addon ${projectId} not found in loaded addons. Try opening a vue-cli project first?`)
}

function serve (req, res) {
  const { id, 0: file } = req.params
  serveFile(id, path.join('ui-public', file), res)
}

function serveLogo (req, res) {
  const { id } = req.params
  serveFile(id, 'logo.png', res)
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
  updateAll,
  runInvoke,
  resetPluginApi,
  getApi,
  finishInstall,
  callAction,
  callHook,
  serve,
  serveLogo
}
