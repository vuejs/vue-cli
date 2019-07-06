const path = require('path')
const fs = require('fs-extra')
const LRU = require('lru-cache')
const chalk = require('chalk')
// Context
const getContext = require('../context')
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
const dependencies = require('./dependencies')
// Api
const PluginApi = require('../api/PluginApi')
// Utils
const {
  isPlugin,
  isOfficialPlugin,
  getPluginLink,
  resolveModule,
  loadModule,
  clearModule,
  execa
} = require('@vue/cli-shared-utils')
const {
  progress: installProgress,
  installPackage,
  uninstallPackage,
  updatePackage
} = require('@vue/cli/lib/util/installDeps')
const { getCommand } = require('../util/command')
const ipc = require('../util/ipc')
const { log } = require('../util/logger')
const { notify } = require('../util/notification')

const PROGRESS_ID = 'plugin-installation'
const CLI_SERVICE = '@vue/cli-service'

// Caches
const logoCache = new LRU({
  max: 50
})

// Local
let currentPluginId
let eventsInstalled = false
let installationStep
let pluginsStore = new Map()
let pluginApiInstances = new Map()
let pkgStore = new Map()

async function list (file, context, { resetApi = true, lightApi = false, autoLoadApi = true } = {}) {
  let pkg = folders.readPackage(file, context)
  let pkgContext = cwd.get()
  // Custom package.json location
  if (pkg.vuePlugins && pkg.vuePlugins.resolveFrom) {
    pkgContext = path.resolve(cwd.get(), pkg.vuePlugins.resolveFrom)
    pkg = folders.readPackage(pkgContext, context)
  }
  pkgStore.set(file, { pkgContext, pkg })

  let plugins = []
  plugins = plugins.concat(findPlugins(pkg.devDependencies || {}, file))
  plugins = plugins.concat(findPlugins(pkg.dependencies || {}, file))

  // Put cli service at the top
  const index = plugins.findIndex(p => p.id === CLI_SERVICE)
  if (index !== -1) {
    const service = plugins[index]
    plugins.splice(index, 1)
    plugins.unshift(service)
  }

  pluginsStore.set(file, plugins)

  log('Plugins found:', plugins.length, chalk.grey(file))

  if (resetApi || (autoLoadApi && !pluginApiInstances.has(file))) {
    await resetPluginApi({ file, lightApi }, context)
  }
  return plugins
}

function findOne ({ id, file }, context) {
  const plugins = getPlugins(file)
  const plugin = plugins.find(
    p => p.id === id
  )
  if (!plugin) log('Plugin Not found', id, chalk.grey(file))
  return plugin
}

function findPlugins (deps, file) {
  return Object.keys(deps).filter(
    id => isPlugin(id) || id === CLI_SERVICE
  ).map(
    id => ({
      id,
      versionRange: deps[id],
      official: isOfficialPlugin(id) || id === CLI_SERVICE,
      installed: fs.existsSync(dependencies.getPath({ id, file })),
      website: getLink(id),
      baseDir: file
    })
  )
}

function getLink (id) {
  if (id === CLI_SERVICE) return 'https://cli.vuejs.org/'
  return getPluginLink(id)
}

function getPlugins (file) {
  const plugins = pluginsStore.get(file)
  if (!plugins) return []
  return plugins
}

function resetPluginApi ({ file, lightApi }, context) {
  return new Promise((resolve, reject) => {
    log('Plugin API reloading...', chalk.grey(file))

    const widgets = require('./widgets')

    let pluginApi = pluginApiInstances.get(file)
    let projectId

    // Clean up
    if (pluginApi) {
      projectId = pluginApi.project.id
      pluginApi.views.forEach(r => views.remove(r.id, context))
      pluginApi.ipcHandlers.forEach(fn => ipc.off(fn))
    }
    if (!lightApi) {
      if (projectId) sharedData.unWatchAll({ projectId }, context)
      clientAddons.clear(context)
      suggestions.clear(context)
      widgets.reset(context)
    }

    // Cyclic dependency with projects connector
    setTimeout(async () => {
      const projects = require('./projects')
      const project = projects.findByPath(file, context)

      if (!project) {
        resolve(false)
        return
      }

      const plugins = getPlugins(file)

      if (project && projects.getType(project, context) !== 'vue') {
        resolve(false)
        return
      }

      pluginApi = new PluginApi({
        plugins,
        file,
        project,
        lightMode: lightApi
      }, context)
      pluginApiInstances.set(file, pluginApi)

      // Run Plugin API
      runPluginApi(path.resolve(__dirname, '../../'), pluginApi, context, 'ui-defaults')
      plugins.forEach(plugin => runPluginApi(plugin.id, pluginApi, context))
      // Local plugins
      const { pkg, pkgContext } = pkgStore.get(file)
      if (pkg.vuePlugins && pkg.vuePlugins.ui) {
        const files = pkg.vuePlugins.ui
        if (Array.isArray(files)) {
          for (const file of files) {
            runPluginApi(pkgContext, pluginApi, context, file)
          }
        }
      }
      // Add client addons
      pluginApi.clientAddons.forEach(options => {
        clientAddons.add(options, context)
      })
      // Add views
      for (const view of pluginApi.views) {
        await views.add({ view, project }, context)
      }
      // Register widgets
      for (const definition of pluginApi.widgetDefs) {
        await widgets.registerDefinition({ definition, project }, context)
      }

      if (lightApi) {
        resolve(true)
        return
      }

      if (projectId !== project.id) {
        callHook({
          id: 'projectOpen',
          args: [project, projects.getLast(context)],
          file
        }, context)
      } else {
        callHook({
          id: 'pluginReload',
          args: [project],
          file
        }, context)

        // View open hook
        const currentView = views.getCurrent()
        if (currentView) views.open(currentView.id)
      }

      // Load widgets for current project
      widgets.load(context)

      resolve(true)
    })
  })
}

function runPluginApi (id, pluginApi, context, filename = 'ui') {
  const name = filename !== 'ui' ? `${id}/${filename}` : id

  let module
  try {
    module = loadModule(`${id}/${filename}`, pluginApi.cwd, true)
  } catch (e) {
    if (process.env.VUE_CLI_DEBUG) {
      console.error(e)
    }
  }
  if (module) {
    if (typeof module !== 'function') {
      log(`${chalk.red('ERROR')} while loading plugin API: no function exported, for`, name, chalk.grey(pluginApi.cwd))
      logs.add({
        type: 'error',
        message: `An error occurred while loading ${name}: no function exported`
      })
    } else {
      pluginApi.pluginId = id
      try {
        module(pluginApi)
        log('Plugin API loaded for', name, chalk.grey(pluginApi.cwd))
      } catch (e) {
        log(`${chalk.red('ERROR')} while loading plugin API for ${name}:`, e)
        logs.add({
          type: 'error',
          message: `An error occurred while loading ${name}: ${e.message}`
        })
      }
      pluginApi.pluginId = null
    }
  }

  // Locales
  try {
    const folder = fs.existsSync(id) ? id : dependencies.getPath({ id, file: pluginApi.cwd })
    locales.loadFolder(folder, context)
  } catch (e) {}
}

function getApi (folder) {
  const pluginApi = pluginApiInstances.get(folder)
  return pluginApi
}

function callHook ({ id, args, file }, context) {
  const pluginApi = getApi(file)
  if (!pluginApi) return
  const fns = pluginApi.hooks[id]
  log(`Hook ${id}`, fns.length, 'handlers')
  fns.forEach(fn => fn(...args))
}

async function getLogo (plugin, context) {
  const { id, baseDir } = plugin
  const cached = logoCache.get(id)
  if (cached) {
    return cached
  }
  const folder = dependencies.getPath({ id, file: baseDir })
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
      await installPackage(cwd.get(), getCommand(cwd.get()), null, id)
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

function installLocal (context) {
  const projects = require('./projects')
  const folder = cwd.get()
  cwd.set(projects.getCurrent(context).path, context)
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    const pkg = loadModule(path.resolve(folder, 'package.json'), cwd.get(), true)

    const id = pkg.name

    setProgress({
      status: 'plugin-install',
      args: [id]
    })
    currentPluginId = id
    installationStep = 'install'

    // Update package.json
    {
      const pkgFile = path.resolve(cwd.get(), 'package.json')
      const pkg = await fs.readJson(pkgFile)
      if (!pkg.devDependencies) pkg.devDependencies = {}
      pkg.devDependencies[id] = `file:${folder}`
      await fs.writeJson(pkgFile, pkg, {
        spaces: 2
      })
    }

    const from = path.resolve(cwd.get(), folder)
    const to = path.resolve(cwd.get(), 'node_modules', ...id.split('/'))
    console.log('copying from', from, 'to', to)
    await fs.copy(from, to)

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
      await uninstallPackage(cwd.get(), getCommand(cwd.get()), null, id)
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
      const child = execa('vue', [
        'invoke',
        id,
        '--$inlineOptions',
        JSON.stringify(prompts.getAnswers())
      ], {
        cwd: cwd.get(),
        stdio: ['inherit', 'pipe', 'inherit']
      })

      const onData = buffer => {
        const text = buffer.toString().trim()
        if (text) {
          setProgress({
            info: text
          })
          logs.add({
            type: 'info',
            message: text
          }, context)
        }
      }

      child.stdout.on('data', onData)

      await child
    }
    // Run plugin api
    runPluginApi(id, getApi(cwd.get()), context)
    installationStep = 'diff'

    notify({
      title: `Plugin invoked successfully`,
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
    let data = require(path.join(dependencies.getPath({ id, file: cwd.get() }), 'prompts'))
    if (typeof data === 'function') {
      data = await data()
    }
    data.forEach(prompts.add)
  } catch (e) {
    console.warn(`No prompts found for ${id}`)
  }
  await prompts.start()
}

function update ({ id, full }, context) {
  return progress.wrap('plugin-update', context, async setProgress => {
    setProgress({
      status: 'plugin-update',
      args: [id]
    })
    currentPluginId = id
    const plugin = findOne({ id, file: cwd.get() }, context)
    const { current, wanted, localPath } = await dependencies.getVersion(plugin, context)

    if (localPath) {
      await updateLocalPackage({ cwd: cwd.get(), id, localPath, full }, context)
    } else {
      await updatePackage(cwd.get(), getCommand(cwd.get()), null, id)
    }

    logs.add({
      message: `Plugin ${id} updated from ${current} to ${wanted}`,
      type: 'info'
    }, context)

    notify({
      title: `Plugin updated`,
      message: `Plugin ${id} was successfully updated`,
      icon: 'done'
    })

    await resetPluginApi({ file: cwd.get() }, context)
    dependencies.invalidatePackage({ id }, context)

    currentPluginId = null
    return findOne({ id, file: cwd.get() }, context)
  })
}

async function updateLocalPackage ({ id, cwd, localPath, full = true }, context) {
  const from = path.resolve(cwd, localPath)
  const to = path.resolve(cwd, 'node_modules', ...id.split('/'))
  let filterRegEx
  if (full) {
    await fs.remove(to)
    filterRegEx = /\.git/
  } else {
    filterRegEx = /(\.git|node_modules)/
  }
  await fs.copy(from, to, {
    filter: (file) => !file.match(filterRegEx)
  })
}

async function updateAll (context) {
  return progress.wrap('plugins-update', context, async setProgress => {
    const plugins = await list(cwd.get(), context, { resetApi: false })
    let updatedPlugins = []
    for (const plugin of plugins) {
      const version = await dependencies.getVersion(plugin, context)
      if (version.current !== version.wanted) {
        updatedPlugins.push(plugin)
        dependencies.invalidatePackage({ id: plugin.id }, context)
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

    await updatePackage(cwd.get(), getCommand(cwd.get()), null, updatedPlugins.map(
      p => p.id
    ).join(' '))

    notify({
      title: `Plugins updated`,
      message: `${updatedPlugins.length} plugin(s) were successfully updated`,
      icon: 'done'
    })

    await resetPluginApi({ file: cwd.get() }, context)

    return updatedPlugins
  })
}

async function callAction ({ id, params, file = cwd.get() }, context) {
  const pluginApi = getApi(file)

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

function serveFile ({ pluginId, projectId = null, file }, res) {
  let baseFile = cwd.get()
  if (projectId) {
    const projects = require('./projects')
    const project = projects.findOne(projectId, getContext())
    if (project) {
      baseFile = project.path
    }
  }

  if (pluginId) {
    const basePath = pluginId === '.' ? baseFile : dependencies.getPath({ id: decodeURIComponent(pluginId), file: baseFile })
    if (basePath) {
      res.sendFile(path.join(basePath, file))
      return
    }
  } else {
    console.log('serve issue', 'pluginId:', pluginId, 'projectId:', projectId, 'file:', file)
  }

  res.status(404)
  res.send(`Addon ${pluginId} not found in loaded addons. Try opening a vue-cli project first?`)
}

function serve (req, res) {
  const { id: pluginId, 0: file } = req.params
  serveFile({ pluginId, file: path.join('ui-public', file) }, res)
}

function serveLogo (req, res) {
  const { id: pluginId } = req.params
  const { project: projectId } = req.query
  serveFile({ pluginId, projectId, file: 'logo.png' }, res)
}

module.exports = {
  list,
  findOne,
  getLogo,
  getInstallation,
  install,
  installLocal,
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
