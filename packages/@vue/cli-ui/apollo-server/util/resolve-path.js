const path = require('path')

exports.resolveModuleRoot = function (filePath, id = null) {
  {
    const index = filePath.lastIndexOf(path.sep + 'index.js')
    if (index !== -1) {
      filePath = filePath.substr(0, index)
    }
  }
  if (id) {
    id = id.replace(/\//g, path.sep)
    const index = filePath.lastIndexOf(id)
    if (index !== -1) {
      filePath = filePath.substr(0, index + id.length)
    }
  }
  return filePath
}
