var chalk = require('chalk')
var format = require('util').format

/**
 * Prefix.
 */

var prefix = '   vue-cli'
var sep = chalk.gray('·')

/**
 * Log a `message` to the console.
 *
 * @param {String} message
 */

exports.log = function () {
  var msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} message
 */

exports.fatal = function (message) {
  if (message instanceof Error) message = message.message.trim()
  var msg = format.apply(format, arguments)
  console.error(chalk.red(prefix), sep, msg)
  process.exit(1)
}

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} message
 */

exports.success = function () {
  var msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}
