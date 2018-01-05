const path = require('path')
const rimraf = require('rimraf')

module.exports = () => {
  rimraf.sync(path.resolve(__dirname, '../packages/test/*'))
}
