const babel = require('@babel/core')

const lib = exports.babelHelpers = {}

lib.loadUsersConfig = (rootDir) => {
  if (typeof rootDir !== 'string') {
    throw new TypeError('`rootDir` must be a string')
  }

  const options = {
    cwd: rootDir,
    filename: 'package.json'
  }

  const partial = babel.loadPartialConfig(options)

  delete partial.options.filename

  const normalize = item => [item.file.resolved, item.options]

  partial.options.plugins = partial.options.plugins.map(normalize)
  partial.options.presets = partial.options.presets.map(normalize)

  const a = partial.options
  const b = { configFile: partial.config }
  const config = Object.assign({}, a, b)

  return config
}

lib.resolveNodeModulesIgnorePattern = (include) => {
  const pattern = 'node_modules'

  if (Array.isArray(include) && include.length !== 0) {
    return `${pattern}\/(?!${include.join('|')})`
  }

  return pattern
}
