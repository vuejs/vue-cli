module.exports = async function getVersions () {
  const current = require(`../../package.json`).version
  let latest
  if (process.env.VUE_CLI_LATEST_VERSION) {
    // cached value
    latest = process.env.VUE_CLI_LATEST_VERSION
  } else if (process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG) {
    // test/debug, use local version
    latest = process.env.VUE_CLI_LATEST_VERSION = current
  } else {
    const getPackageVersion = require('./getPackageVersion')
    const res = await getPackageVersion('vue-cli-version-marker', 'latest')
    if (res.statusCode === 200) {
      latest = process.env.VUE_CLI_LATEST_VERSION = res.body.version
    } else {
      // fallback to local version
      latest = process.env.VUE_CLI_LATEST_VERSION = current
    }
  }
  return {
    current,
    latest
  }
}
