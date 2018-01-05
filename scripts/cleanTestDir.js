const path = require('path')
const rimraf = require('rimraf')

rimraf.sync(path.resolve(__dirname, '../packages/test/*'))
