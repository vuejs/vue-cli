const path = require('path')

module.exports = function safeJoinPublicPath (publicPath, joinPath) {
  let urlPath = publicPath
  let pathPrefix = ''
  if (/:\/\//.test(urlPath)) {
  // publicPath like http://example.com/path/to/
    [pathPrefix, urlPath] = urlPath.split('://')
    pathPrefix = `${pathPrefix}://`
  } else if (/^\/\//.test(urlPath)) {
  // publicPath like //example.com/path/to/
    pathPrefix = '/'
  }
  return `${pathPrefix}${path.join(urlPath, joinPath)}`
}
