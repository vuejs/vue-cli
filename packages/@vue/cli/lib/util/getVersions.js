const fs = require('fs-extra')
const path = require('path')
const fsCachePath = path.resolve(__dirname, '.version')

module.exports = async function getVersions () {
  let latest
  const current = require(`../../package.json`).version
  if (process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG) {
    return {
      latest: current,
      current
    }
  }

  if (fs.existsSync(fsCachePath)) {
    // if we haven't check for a new version in a week, force a full check
    // before proceeding.
    const lastChecked = (await fs.stat(fsCachePath)).mtimeMs
    const daysPassed = (Date.now() - lastChecked) / (60 * 60 * 1000 * 24)
    if (daysPassed > 7) {
      await getAndCacheLatestVersion(current)
    }
    latest = await fs.readFile(fsCachePath, 'utf-8')
  } else {
    // if the cache file doesn't exist, this is likely a fresh install
    // so no need to check
    latest = current
  }

  // Do a check in the background. The cached file will be used for the next
  // startup within a week.
  getAndCacheLatestVersion(current)

  return {
    current,
    latest
  }
}

// fetch the latest version and save it on disk
// so that it is available immediately next time
let sentCheckRequest = false
async function getAndCacheLatestVersion (current) {
  if (sentCheckRequest) {
    return
  }
  sentCheckRequest = true
  const getPackageVersion = require('./getPackageVersion')
  const res = await getPackageVersion('vue-cli-version-marker', 'latest')
  if (res.statusCode === 200) {
    const { version } = res.body
    if (version !== current) {
      await fs.writeFile(fsCachePath, version)
    }
  }
}
