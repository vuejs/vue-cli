const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const semver = require('semver')
// Connectors
const cwd = require('./cwd')
const folders = require('./folders')
const progress = require('./progress')
const logs = require('./logs')
// Context
const getContext = require('../context')
// Utils
const { isPlugin } = require('@vue/cli-shared-utils')
const { resolveModule } = require('@vue/cli/lib/util/module')
const getPackageVersion = require('@vue/cli/lib/util/getPackageVersion')
const {
  progress: installProgress,
  installPackage,
  uninstallPackage,
  updatePackage
} = require('@vue/cli/lib/util/installDeps')
const { getCommand } = require('../util/command')
const { resolveModuleRoot } = require('../util/resolve-path')
const { notify } = require('../util/notification')

const PROGRESS_ID = 'dependency-installation'
const CLI_SERVICE = '@vue/cli-service'

// Caches
const metadataCache = new LRU({
  max: 200,
  maxAge: 1000 * 60 * 30 // 30 min.
})

// Local
let dependencies

function list (file, context) {
  const pkg = folders.readPackage(file, context)
  dependencies = []
  dependencies = dependencies.concat(
    findDependencies(pkg.devDependencies || {}, 'devDependencies', context)
  )
  dependencies = dependencies.concat(
    findDependencies(pkg.dependencies || {}, 'dependencies', context)
  )
  return dependencies
}

function findOne (id, context) {
  return dependencies.find(
    p => p.id === id
  )
}

function findDependencies (deps, type, context) {
  return Object.keys(deps).filter(
    id => !isPlugin(id) && id !== CLI_SERVICE
  ).map(
    id => ({
      id,
      versionRange: deps[id],
      installed: fs.existsSync(getPath(id)),
      website: getLink(id, context),
      type
    })
  )
}

function getPath (id) {
  return resolveModuleRoot(resolveModule(path.join(id, 'package.json'), cwd.get()), id)
}

function readPackage (id, context) {
  try {
    return folders.readPackage(getPath(id), context)
  } catch (e) {
    console.log(e)
  }
  return {}
}

function invalidatePackage (id, context) {
  return folders.invalidatePackage(getPath(id), context)
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

function getLink (id, context) {
  const pkg = readPackage(id, context)
  return pkg.homepage ||
    (pkg.repository && pkg.repository.url) ||
    `https://www.npmjs.com/package/${id.replace(`/`, `%2F`)}`
}

function install ({ id, type }, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'dependency-install',
      args: [id]
    })
    await installPackage(cwd.get(), getCommand(cwd.get()), null, id, type === 'devDependencies')

    logs.add({
      message: `Dependency ${id} installed`,
      type: 'info'
    }, context)

    notify({
      title: `Dependency installed`,
      message: `Dependency ${id} successfully installed`,
      icon: 'done'
    })

    list(cwd.get(), context)

    return findOne(id, context)
  })
}

function uninstall ({ id }, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'dependency-uninstall',
      args: [id]
    })

    const dep = findOne(id, context)

    await uninstallPackage(cwd.get(), getCommand(cwd.get()), null, id)

    logs.add({
      message: `Dependency ${id} uninstalled`,
      type: 'info'
    }, context)

    notify({
      title: `Dependency uninstalled`,
      message: `Dependency ${id} successfully uninstalled`,
      icon: 'done'
    })

    return dep
  })
}

function update ({ id }, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'dependency-update',
      args: [id]
    })

    const dep = findOne(id, context)
    const { current, wanted } = await getVersion(dep, context)
    await updatePackage(cwd.get(), getCommand(cwd.get()), null, id)

    logs.add({
      message: `Dependency ${id} updated from ${current} to ${wanted}`,
      type: 'info'
    }, context)

    notify({
      title: `Dependency updated`,
      message: `Dependency ${id} was successfully updated`,
      icon: 'done'
    })

    invalidatePackage(id)

    return findOne(id)
  })
}

function updateAll (context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    const deps = list(cwd.get(), context)
    let updatedDeps = []
    for (const dep of deps) {
      const version = await getVersion(dep, context)
      if (version.current !== version.wanted) {
        updatedDeps.push(dep)
        invalidatePackage(dep.id, context)
      }
    }

    if (!updatedDeps.length) {
      notify({
        title: `No updates available`,
        message: `No dependency to update in the version ranges declared in package.json`,
        icon: 'done'
      })
      return []
    }

    setProgress({
      status: 'dependencies-update',
      args: [updatedDeps.length]
    })

    await updatePackage(cwd.get(), getCommand(cwd.get()), null, updatedDeps.map(
      p => p.id
    ).join(' '))

    notify({
      title: `Dependencies updated`,
      message: `${updatedDeps.length} dependencies were successfully updated`,
      icon: 'done'
    })

    return updatedDeps
  })
}

function setup (context) {
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

setup(getContext())

module.exports = {
  list,
  findOne,
  getPath,
  getMetadata,
  getLink,
  getDescription,
  getVersion,
  install,
  uninstall,
  update,
  updateAll,
  invalidatePackage
}
