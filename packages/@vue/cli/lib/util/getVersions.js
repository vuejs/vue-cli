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
    const axios = require('axios')
    const options = require('../options').loadOptions()
    const registry = options.useTaobaoRegistry
      ? `https://registry.npm.taobao.org`
      : `https://registry.npmjs.org`

    const res = await axios.get(`${registry}/vue-cli-version-marker/latest`)
    if (res.status === 200) {
      latest = process.env.VUE_CLI_LATEST_VERSION = res.data.version
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
