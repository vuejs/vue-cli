const chalk = require('chalk')
const TYPE = 'cant-resolve-loader'
const errorRE = /Can't resolve '(.*loader)'/

exports.transformer = error => {
  if (error.webpackError) {
    const match = error.webpackError.message.match(errorRE)
    if (match) {
      return Object.assign({}, error, {
        type: TYPE,
        loader: match[1]
      })
    }
  }
  return error
}

exports.formatter = errors => {
  errors = errors.filter(e => e.type === TYPE)
  if (errors.length) {
    return errors.map(e => {
      return `Failed to resolve loader: ${chalk.yellow(e.loader)}`
    }).concat(`\nYou may need to install the missing loader.`)
  }
}
