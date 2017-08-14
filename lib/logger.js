const chalk = require('chalk')
const format = require('util').format

/**
 * Prefix.
 */

const prefix = '   vue-cli'
const sep = chalk.gray('·')

/**
 * Log a `message` to the console.
 *
 * @param {String} message
 */

exports.log = () => {
  let msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} message
 */

exports.fatal = message => {
  if (message instanceof Error) message = message.message.trim()
  let msg = format.apply(format, arguments)
  console.error(chalk.red(prefix), sep, msg)
  process.exit(1)
}

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} message
 */

exports.success = () => {
  let msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}
