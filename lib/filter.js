var match = require('minimatch')
var chalk = require('chalk')
var evaluate = require('./eval')

module.exports = function (files, filters, data, done) {
  if (!filters) {
    return done()
  }
  var fileNames = Object.keys(files)
  Object.keys(filters).forEach(function (glob) {
    fileNames.forEach(function (file) {
      if (match(file, glob)) {
        var condition = filters[glob]
        if (!evaluate(condition, data)) {
          delete files[file]
        }
      }
    })
  })
  done()
}
