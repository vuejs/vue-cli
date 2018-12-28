const path = require('path')
const getPackageJson = require('./get-package-json')

module.exports = function getInstalledVersion (packageName) {
  // for first level deps, read package.json directly is way faster than `npm list`
  try {
    const packageJson = getPackageJson(
      path.resolve(process.cwd(), 'node_modules', packageName)
    )
    return packageJson.version
  } catch (e) {
    return 'N/A'
  }
}
