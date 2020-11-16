const { loadModule } = require('@vue/cli-shared-utils')

const moduleCache = {}

/**
 * If the user has installed a version of webpack themself, load it.
 * Otherwise, load the webpack that @vue/cli-service depends on.
 * @param {string} cwd the user project root
 * @returns {import('webpack')} note: the return type is for webpack 5 only
 */
module.exports = function loadWebpack (cwd) {
  if (moduleCache[cwd]) {
    return moduleCache[cwd]
  }

  // Check the package.json,
  // and only load from the project if webpack is explictly depended on,
  // in case of accidental hoisting.
  let pkg = {}
  try {
    pkg = loadModule('./package.json', cwd)
  } catch (e) {}

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.optionalDependencies
  }

  const webpack = deps.webpack
    ? loadModule('webpack', cwd)
    : require('webpack')
  moduleCache[cwd] = webpack

  return webpack
}
