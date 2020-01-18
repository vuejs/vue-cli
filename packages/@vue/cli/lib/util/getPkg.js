// Get the package.json containing all the `vue-cli-pluin-*` dependencies
// See issue #1815

const path = require('path')
const getPackageJson = require('./getPackageJson')

module.exports = function getPkg (context) {
  const pkg = getPackageJson(context)
  if (pkg.vuePlugins && pkg.vuePlugins.resolveFrom) {
    return getPackageJson(path.resolve(context, pkg.vuePlugins.resolveFrom))
  }
  return pkg
}
