const fs = require('fs-extra')
const loadPresetFromDir = require('./loadPresetFromDir')

module.exports = async function loadLocalPreset (path) {
  const stats = fs.statSync(path)
  if (stats.isFile()) {
    return await fs.readJson(path)
  } else if (stats.isDirectory()) {
    return await loadPresetFromDir(path)
  } else {
    throw new Error(`Invalid local preset path: ${path}`)
  }
}
