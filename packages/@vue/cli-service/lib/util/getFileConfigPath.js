const path = require('path')
const fs = require('fs')

module.exports = function getFileConfigPath (context) {
  const possibleConfigPaths = [
    process.env.VUE_CLI_SERVICE_CONFIG_PATH,
    './vue.config.js',
    './vue.config.cjs'
  ]

  let fileConfigPath
  for (const p of possibleConfigPaths) {
    const resolvedPath = p && path.resolve(context, p)
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      fileConfigPath = resolvedPath
      break
    }
  }

  return fileConfigPath
}
