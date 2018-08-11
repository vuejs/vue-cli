const path = require('path')
const homedir = require('os').homedir()

const CONFIG_FILE_NAME = '.vuerc'
const CONFIG_FILE_PATH = path.resolve(homedir, CONFIG_FILE_NAME)

module.exports = {
  CONFIG_FILE_NAME,
  CONFIG_FILE_PATH
}
