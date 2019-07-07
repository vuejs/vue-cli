const execa = require('execa')
const minimist = require('minimist')
const semver = require('semver')
const LRU = require('lru-cache')

const {
  hasYarn,
  hasProjectYarn,
  hasPnpm3OrLater,
  hasProjectPnpm
} = require('@vue/cli-shared-utils')

const { loadOptions } = require('../options')
const registries = require('./registries')
const shouldUseTaobao = require('./shouldUseTaobao')

function getCommand (cwd) {
  if (!cwd) {
    return loadOptions().packageManager || (hasYarn() ? 'yarn' : hasPnpm3OrLater() ? 'pnpm' : 'npm')
  }
  return hasProjectYarn(cwd) ? 'yarn' : hasProjectPnpm(cwd) ? 'pnpm' : 'npm'
}

// Any command that implemented registry-related feature should support
// `-r` / `--registry` option
async function getRegistry ({ cwd, packageManager } = {}) {
  const args = minimist(process.argv, {
    alias: {
      r: 'registry'
    }
  })

  if (args.registry) {
    return args.registry
  }

  if (await shouldUseTaobao()) {
    return registries.taobao
  }

  if (!packageManager) {
    packageManager = getCommand(cwd)
  }
  const { stdout } = await execa(packageManager, ['config', 'get', 'registry'])
  return stdout
}

const metadataCache = new LRU({
  max: 200,
  maxAge: 1000 * 60 * 30 // 30 min.
})

async function getMetadata (packageName, { field = '', packageManager, cwd } = {}) {
  if (!packageManager) {
    packageManager = getCommand(cwd)
  }
  const registry = await getRegistry({ cwd, packageManager })

  const metadataKey = `${packageManager}-${registry}-${packageName}`
  let metadata = metadataCache.get(metadataKey)

  if (metadata) {
    return metadata
  }

  const { stdout } = await execa(
    packageManager,
    [
      'info',
      packageName,
      field,
      '--json',
      '--registry',
      registry
    ]
  )

  metadata = JSON.parse(stdout)
  if (packageManager === 'yarn') {
    // `yarn info` outputs messages in the form of `{"type": "inspect", data: {}}`
    metadata = metadata.data
  }

  metadataCache.set(metadataKey, metadata)
  return metadata
}

async function getVersion (packageName, versionRange, cwd) {
  const metadata = await getMetadata(packageName, { cwd })
  if (Object.keys(metadata['dist-tags']).includes(versionRange)) {
    return metadata['dist-tags'][versionRange]
  }
  const versions = Array.isArray(metadata.versions) ? metadata.versions : Object.keys(metadata.versions)
  return semver.maxSatisfying(versions, versionRange)
}

module.exports = {
  getCommand,
  getRegistry,
  getMetadata,
  getVersion
}
