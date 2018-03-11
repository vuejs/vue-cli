const path = require('path')
const fs = require('fs')
const LRU = require('lru-cache')
const { isPlugin, isOfficialPlugin, getPluginLink } = require('@vue/cli-shared-utils')
const getPackageVersion = require('@vue/cli/lib/util/getPackageVersion')

const cwd = require('./cwd')
const folders = require('./folders')

const metadataCache = new LRU({
  max: 200,
  maxAge: 1000 * 60 * 30
})

const logoCache = new LRU({
  max: 50
})

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

module.exports = {
  list,
  getVersion,
  getDescription,
  getLogo
}
