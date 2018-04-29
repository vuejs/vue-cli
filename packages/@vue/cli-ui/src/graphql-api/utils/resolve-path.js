exports.resolveModuleRoot = function (filePath, id = null) {
  {
    const index = filePath.lastIndexOf('/index.js')
    if (index !== -1) {
      filePath = filePath.substr(0, index)
    }
  }
  if (id) {
    const index = filePath.lastIndexOf(id)
    if (index !== -1) {
      filePath = filePath.substr(0, index + id.length)
    }
  }
  return filePath
}
