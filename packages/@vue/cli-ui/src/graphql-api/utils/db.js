const Lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const fs = require('fs-extra')
const { resolve } = require('path')

let folder = '../../../live'

if (process.env.NODE_ENV === 'test') {
  folder = '../../../live-test'
  // Clean DB
  fs.removeSync(resolve(__dirname, folder))
}

fs.ensureDirSync(resolve(__dirname, folder))

const db = new Lowdb(new FileSync(resolve(__dirname, folder, 'db.json')))

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
