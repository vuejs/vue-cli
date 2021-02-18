const path = require('path')
const { warn, loadModule, resolveModule } = require('@vue/cli-shared-utils')
const moduleAlias = require('module-alias')

/**
 * If the user has installed a version of webpack themself, load it.
 * Otherwise, load the webpack that @vue/cli-service depends on.
 * @param {string} cwd the user project root
 * @returns {import('webpack')} note: the return type is for webpack 5 only
 */
module.exports = function checkWebpack (cwd) {
  // Jest module alias can't affect sub-processes, so we have to alias it manually
  if (
    process.env.VUE_CLI_TEST &&
    process.env.VUE_CLI_USE_WEBPACK4 &&
    require('webpack/package.json').version[0] !== '4'
  ) {
    const webpack4Path = path.dirname(require.resolve('webpack-4/package.json'))
    moduleAlias.addAlias('webpack', webpack4Path)

    return
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

  if (deps.webpack) {
    const customWebpackVersion = loadModule('webpack/package.json', cwd).version
    const requiredWebpackVersion = require('webpack/package.json').version

    // A custom webpack version is found but no force resolutions used.
    // So the webpack version in this package is still 5.x.
    // This may cause problems for loaders/plugins required in this package.
    // Because many uses runtime sniffing to run conditional code for different webpack versions.
    if (customWebpackVersion !== requiredWebpackVersion) {
      // TODO: recommend users to use yarn force resolutions or pnpm hooks instead
      warn(`Using "module-alias" to load custom webpack version.`)

      const webpack4Path = path.dirname(resolveModule('webpack/package.json', cwd))
      moduleAlias.addAlias('webpack', webpack4Path)
    }
  }
}
