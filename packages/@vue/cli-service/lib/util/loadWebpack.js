const path = require('path')
const { warn, loadModule, resolveModule } = require('@vue/cli-shared-utils')

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

  // A custom webpack version is found but no force resolutions used.
  // So the webpack version in this package is still 5.x.
  // This may cause problems for loaders/plugins required in this package.
  // Because many uses runtime sniffing to run conditional code for different webpack versions.
  if (webpack.version !== require('webpack').version) {
    // TODO: recommend users to use yarn force resolutions or pnpm hooks instead
    warn(`Using "module-alias" to load custom webpack version.`)

    const moduleAlias = require('module-alias')
    const webpackPath = path.dirname(resolveModule('webpack/package.json', cwd))
    moduleAlias.addAlias('webpack', webpackPath)
  }

  moduleCache[cwd] = webpack

  return webpack
}
