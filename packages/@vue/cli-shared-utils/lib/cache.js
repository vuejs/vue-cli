const fs = require('fs')
const path = require('path')

exports.genCacheConfig = (api, options, id, configFile) => {
  const cacheDirectory = process.env.VUE_CLI_TEST
    ? path.resolve(__dirname, `../../../../node_modules/.cache/${id}`)
    : api.resolve(`node_modules/.cache/${id}`)

  const variables = {
    [id]: require(`${id}/package.json`).version,
    'cache-loader': require('cache-loader/package.json').version,
    env: process.env.NODE_ENV,
    test: !!process.env.VUE_CLI_TEST,
    config: (options.chainWebpack || '').toString() + (options.configureWebpack || '').toString()
  }
  if (configFile) {
    const file = api.resolve(configFile)
    if (fs.existsSync(file)) {
      variables.configFile = fs.readFileSync(configFile, 'utf-8')
    }
  }
  const cacheIdentifier = JSON.stringify(variables)

  return { cacheDirectory, cacheIdentifier }
}
