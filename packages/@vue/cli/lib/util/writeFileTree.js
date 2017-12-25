const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports = function writeFileTree (dir, files) {
  for (const name in files) {
    const filePath = path.join(dir, name)
    mkdirp.sync(path.dirname(filePath))
    fs.writeFileSync(filePath, files[name])
  }
}
