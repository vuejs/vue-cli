const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const unlink = promisify(fs.unlink)
const mkdirp = promisify(require('mkdirp'))
const write = promisify(fs.writeFile)

async function deleteRemovedFiles (directory, newFiles, previousFiles) {
  // get all files that are not in the new filesystem and are still existing
  const filesToDelete = Object.keys(previousFiles)
    .filter(filename => !newFiles[filename])

  // delete each of these files
  const unlinkPromises = filesToDelete.map(filename => unlink(path.join(directory, filename)))
  return Promise.all(unlinkPromises)
}

module.exports = async function writeFileTree (dir, files, previousFiles) {
  if (process.env.VUE_CLI_SKIP_WRITE) {
    return
  }
  if (previousFiles) {
    await deleteRemovedFiles(dir, files, previousFiles)
  }
  return Promise.all(Object.keys(files).map(async (name) => {
    const filePath = path.join(dir, name)
    await mkdirp(path.dirname(filePath))
    await write(filePath, files[name])
  }))
}
