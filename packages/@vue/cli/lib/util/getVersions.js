const { semver } = require('@vue/cli-shared-utils')
const PackageManager = require('./ProjectPackageManager')
const { loadOptions, saveOptions } = require('../options')

let sessionCached
const pm = new PackageManager()

module.exports = async function getVersions () {
  if (sessionCached) {
    return sessionCached
  }

  let latest
  const local = require(`../../package.json`).version
  if (process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG) {
    return (sessionCached = {
      current: local,
      latest: local,
      latestMinor: local
    })
  }

  // should also check for prerelease versions if the current one is a prerelease
  const includePrerelease = !!semver.prerelease(local)

  const { latestVersion = local, lastChecked = 0 } = loadOptions()
  const cached = latestVersion
  const daysPassed = (Date.now() - lastChecked) / (60 * 60 * 1000 * 24)

  let error
  if (daysPassed > 1) {
    // if we haven't check for a new version in a day, wait for the check
    // before proceeding
    try {
      latest = await getAndCacheLatestVersion(cached, includePrerelease)
    } catch (e) {
      latest = cached
      error = e
    }
  } else {
    // Otherwise, do a check in the background. If the result was updated,
    // it will be used for the next 24 hours.
    // don't throw to interrupt the user if the background check failed
    getAndCacheLatestVersion(cached, includePrerelease).catch(() => {})
    latest = cached
  }

  // if the installed version is updated but the cache doesn't update
  if (semver.gt(local, latest) && !semver.prerelease(local)) {
    latest = local
  }

  let latestMinor = `${semver.major(latest)}.${semver.minor(latest)}.0`
  if (
    // if the latest version contains breaking changes
    /major/.test(semver.diff(local, latest)) ||
    // or if using `next` branch of cli
    (semver.gte(local, latest) && semver.prerelease(local))
  ) {
    // fallback to the local cli version number
    latestMinor = local
  }

  return (sessionCached = {
    current: local,
    latest,
    latestMinor,
    error
  })
}

// fetch the latest version and save it on disk
// so that it is available immediately next time
async function getAndCacheLatestVersion (cached, includePrerelease) {
  let version = await pm.getRemoteVersion('vue-cli-version-marker', 'latest')

  if (includePrerelease) {
    const next = await pm.getRemoteVersion('vue-cli-version-marker', 'next')
    version = semver.gt(next, version) ? next : version
  }

  if (semver.valid(version) && version !== cached) {
    saveOptions({ latestVersion: version, lastChecked: Date.now() })
    return version
  }
  return cached
}
