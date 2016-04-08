var match = require('minimatch')
var chalk = require('chalk')

module.exports = function (files, filters, data, done) {
  if (!filters) {
    return done()
  }
  var fileNames = Object.keys(files)
  Object.keys(filters).forEach(function (glob) {
    fileNames.forEach(function (file) {
      if (match(file, glob)) {
        var condition = filters[glob]
        if (!evalualte(condition, data)) {
          delete files[file]
        }
      }
    })
  })
  done()
}

function evalualte (exp, data) {
  /* eslint-disable no-new-func */
  var fn = new Function('data', 'with (data) { return ' + exp + '}')
  try {
    return fn(data)
  } catch (e) {
    console.error(chalk.red('Error when evaluating filter condition: ' + exp))
  }
}
