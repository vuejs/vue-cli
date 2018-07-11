const path = require('path')

module.exports = function getAssetPath (options, filePath, placeAtRootIfRelative) {
  // if the user is using a relative URL, place js & css at dist root to ensure
  // relative paths work properly
  if (
    placeAtRootIfRelative &&
    !(/^https?:/.test(options.baseUrl)) &&
    options.baseUrl.charAt(0) !== '/'
  ) {
    return filePath.replace(/^\w+\//, '')
  }
  return options.assetsDir
    ? path.posix.join(options.assetsDir, filePath)
    : filePath
}
