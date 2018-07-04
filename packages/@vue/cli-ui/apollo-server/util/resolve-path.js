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
    // With node_modules folder
    let search = `node_modules/${id}`
    let index = filePath.lastIndexOf(search)
    if (index === -1) {
      // Id only
      search = id
      index = filePath.lastIndexOf(search)
    }
    if (index === -1) {
      // Scoped (in dev env)
      index = id.lastIndexOf('/')
      if (index !== -1) {
        search = id.substr(index + 1)
        index = filePath.lastIndexOf(search)
      }
    }

    if (index !== -1) {
      filePath = filePath.substr(0, index + search.length)
    }
  }
  return filePath
}
