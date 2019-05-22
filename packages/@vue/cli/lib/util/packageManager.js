const execa = require('execa')
const semver = require('semver')
const {
  hasYarn,
  hasProjectYarn,
  hasPnpm3OrLater,
  hasProjectPnpm
} = require('@vue/cli-shared-utils')
const { loadOptions } = require('../options')

function getCommand (cwd = undefined) {
  if (!cwd) {
    return loadOptions().packageManager || (hasYarn() ? 'yarn' : hasPnpm3OrLater() ? 'pnpm' : 'npm')
  }
  return hasProjectYarn(cwd) ? 'yarn' : hasProjectPnpm(cwd) ? 'pnpm' : 'npm'
}

// TODO: add cache
async function getMetadata (packageName, { field = '', packageManager, registry, cwd }) {
  if (!packageManager) {
    packageManager = getCommand(cwd)
  }

  if (!registry) {
    if ((await require('./shouldUseTaobao')())) {
      registry = `https://registry.npm.taobao.org`
    } else {
      const { stdout } = await execa(packageManager, ['config', 'get', 'registry'])
      registry = stdout
    }
  }

  const { stdout } = await execa(packageManager, ['info', packageName, field, '--json'])
  const metadata = JSON.parse(stdout)

  if (packageManager === 'yarn') {
    // `yarn info` outputs messages in the form of `{"type": "inspect", data: {}}`
    return metadata.data
  }
  return metadata
}

async function getVersion (packageName, versionRange, registry, cwd) {
  const metadata = await getMetadata(packageName, { registry, cwd })
  if (Object.keys(metadata['dist-tags']).includes(versionRange)) {
    return metadata['dist-tags'][versionRange]
  }
  const versions = Array.isArray(metadata.versions) ? metadata.versions : Object.keys(metadata.versions)
  return semver.maxSatisfying(versions, versionRange)
}

module.exports = {
  getCommand,
  getMetadata,
  getVersion
}
