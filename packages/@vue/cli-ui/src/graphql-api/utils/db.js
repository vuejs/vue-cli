const Lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const { xdgConfigPath } = require('@vue/cli/lib/util/xdgConfig')

let folder

if (process.env.VUE_CLI_UI_TEST) {
  folder = '../../../live-test'
  // Clean DB
  fs.removeSync(path.resolve(__dirname, folder))
} else {
  folder = process.env.VUE_CLI_UI_DB_PATH ||
    xdgConfigPath('.vue-cli-ui') ||
    path.join(os.homedir(), '.vue-cli-ui')
}

fs.ensureDirSync(path.resolve(__dirname, folder))

const db = new Lowdb(new FileSync(path.resolve(__dirname, folder, 'db.json')))

// Seed an empty DB
db.defaults({
  projects: [],
  foldersFavorite: [],
  tasks: [],
  config: {}
}).write()

module.exports = {
  db
}
