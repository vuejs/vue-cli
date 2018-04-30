const fs = require('fs')
const { promisify } = require('util')
const read = promisify(fs.readFile)

module.exports = async function readLocalPreset (dir, preset) {
  const json = await read(preset)
  return JSON.parse(json)
}
