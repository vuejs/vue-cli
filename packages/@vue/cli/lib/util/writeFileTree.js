const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const mkdirp = promisify(require('mkdirp'))
const write = promisify(fs.writeFile)

module.exports = function writeFileTree (dir, files) {
  if (process.env.VUE_CLI_SKIP_WRITE) {
    return
  }
  return Promise.all(Object.keys(files).map(async (name) => {
    const filePath = path.join(dir, name)
    await mkdirp(path.dirname(filePath))
    await write(filePath, files[name])
  }))
}
