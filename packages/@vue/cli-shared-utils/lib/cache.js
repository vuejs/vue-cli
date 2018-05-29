const fs = require('fs')
const hash = require('hash-sum')

exports.genCacheConfig = (api, options, deps, configFiles) => {
  if (!Array.isArray(deps)) {
    deps = [deps]
  }
  const id = deps[0]
  const cacheDirectory = api.resolve(`node_modules/.cache/${id}`)

  const variables = {
    'cache-loader': require('cache-loader/package.json').version,
    env: process.env.NODE_ENV,
    test: !!process.env.VUE_CLI_TEST,
    config: [options.chainWebpack, options.configureWebpack]
  }

  for (const dep of deps) {
    variables[dep] = require(`${dep}/package.json`).version
  }

  const readConfig = file => {
    const absolutePath = api.resolve(file)
    if (fs.existsSync(absolutePath)) {
      return fs.readFileSync(absolutePath, 'utf-8')
    }
  }

  if (configFiles) {
    if (!Array.isArray(configFiles)) {
      configFiles = [configFiles]
    }
    for (const file of configFiles) {
      const content = readConfig(file)
      if (content) {
        variables.configFiles = content
        break
      }
    }
  }

  const cacheIdentifier = hash(variables)
  return { cacheDirectory, cacheIdentifier }
}
