const path = require('path')

exports.ownDir = function (...args) {
  return path.join(__dirname, '../', ...args)
}
