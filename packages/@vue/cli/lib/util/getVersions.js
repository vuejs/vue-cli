const fs = require('fs-extra')
const path = require('path')
const fsCachePath = path.resolve(__dirname, '.versions')

let sessionCached

module.exports = async function getVersions () {
  if (sessionCached) {
    return sessionCached
  }

  let latest
  const local = require('vue-cli-version-marker').devDependencies
  if (process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG) {
    return (sessionCached = {
      current: local,
      latest: local
    })
  }

  if (!fs.existsSync(fsCachePath)) {
    // if the cache file doesn't exist, this is likely a fresh install
    // then create a cache file with the bundled version map
    await fs.writeFile(fsCachePath, JSON.stringify(local))
  }

  const cached = JSON.parse(await fs.readFile(fsCachePath, 'utf-8'))
  const lastChecked = (await fs.stat(fsCachePath)).mtimeMs
  const daysPassed = (Date.now() - lastChecked) / (60 * 60 * 1000 * 24)
  if (daysPassed > 1) {
    // if we haven't check for a new version in a day, wait for the check
    // before proceeding
    latest = await getAndCacheLatestVersions(cached)
  } else {
    // Otherwise, do a check in the background. If the result was updated,
    // it will be used for the next 24 hours.
    getAndCacheLatestVersions(cached)
    latest = cached
  }

  return (sessionCached = {
    current: local,
    latest
  })
}

// fetch the latest version and save it on disk
// so that it is available immediately next time
async function getAndCacheLatestVersions (cached) {
  const getPackageVersion = require('./getPackageVersion')
  const res = await getPackageVersion('vue-cli-version-marker', 'latest')
  if (res.statusCode === 200) {
    const versions = res.body.devDependencies
    await fs.writeFile(fsCachePath, JSON.stringify(versions))
    return versions
  }
  return cached
}
