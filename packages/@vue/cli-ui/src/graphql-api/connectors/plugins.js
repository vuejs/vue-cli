const path = require('path')
const fs = require('fs')
const LRU = require('lru-cache')
const {
  isPlugin,
  isOfficialPlugin,
  getPluginLink,
  hasYarn
} = require('@vue/cli-shared-utils')
const getPackageVersion = require('@vue/cli/lib/util/getPackageVersion')
const {
  progress: installProgress,
  installPackage,
  uninstallPackage
} = require('@vue/cli/lib/util/installDeps')
const { loadOptions } = require('@vue/cli/lib/options')
const invoke = require('@vue/cli/lib/invoke')

const cwd = require('./cwd')
const folders = require('./folders')
const prompts = require('./prompts')
const progress = require('./progress')

const metadataCache = new LRU({
  max: 200,
  maxAge: 1000 * 60 * 30
})

const logoCache = new LRU({
  max: 50
})

const PROGRESS_ID = 'plugin-installation'

let currentPluginId
let eventsInstalled = false

function getPath (id) {
  return path.join(cwd.get(), 'node_modules', id)
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
  let plugins = []
  plugins = plugins.concat(findPlugins(pkg.dependencies || {}))
  plugins = plugins.concat(findPlugins(pkg.devDependencies || {}))
  return plugins
}

function readPackage (id, context) {
  return folders.readPackage(getPath(id), context)
}

async function getMetadata (id) {
  let metadata = metadataCache.get(id)
  if (metadata) {
    return metadata
  }
  const res = await getPackageVersion(id)
  if (res.statusCode === 200) {
    metadata = res.body
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
  let latest
  const metadata = await getMetadata(id)
  if (metadata) {
    latest = metadata['dist-tags'].latest
  }

  if (!latest) {
    // fallback to local version
    latest = current
  }

  return {
    current,
    latest,
    range: versionRange
  }
}

async function getDescription ({ id }, context) {
  const metadata = await getMetadata(id)
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

    const packageManager = loadOptions().packageManager || (hasYarn() ? 'yarn' : 'npm')
    await installPackage(cwd.get(), packageManager, null, id)

    await initPrompts(id, context)

    return getInstallation(context)
  })
}

function uninstall (id, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'plugin-uninstall',
      args: [id]
    })

    currentPluginId = id

    const packageManager = loadOptions().packageManager || (hasYarn() ? 'yarn' : 'npm')
    await uninstallPackage(cwd.get(), packageManager, null, id)

    currentPluginId = null

    return getInstallation(context)
  })
}

function runInvoke (id, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'plugin-invoke',
      args: [id]
    })

    currentPluginId = id

    await invoke(id, prompts.getAnswers(), cwd.get())

    currentPluginId = null

    return getInstallation(context)
  })
}

async function initPrompts (id, context) {
  prompts.reset()
  let data = require(path.join(getPath(id), 'prompts.js'))
  if (typeof data === 'function') {
    data = await data()
  }
  data.forEach(prompts.add)
  prompts.start()
}

module.exports = {
  list,
  getVersion,
  getDescription,
  getLogo,
  getInstallation,
  install,
  uninstall,
  runInvoke
}
