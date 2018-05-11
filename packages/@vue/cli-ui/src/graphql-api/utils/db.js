const Lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const fs = require('fs-extra')
const { resolve } = require('path')

fs.ensureDirSync(resolve(__dirname, '../../../live'))

const db = new Lowdb(new FileSync(resolve(__dirname, '../../../live/db.json')))

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
