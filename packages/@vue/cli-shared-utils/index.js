const chalk = require('chalk')
const padStart = require('string.prototype.padstart')
const { logWithSpinner, stopSpinner } = require('./spinner')

const format = (label, msg) => {
  return msg.split('\n').map((line, i) => {
    return i === 0
      ? `${label} ${line}`
      : padStart(line, chalk.reset(label).length)
  }).join('\n')
}

exports.logWithSpinner = logWithSpinner
exports.stopSpinner = stopSpinner

exports.info = msg => {
  console.log(format(chalk.bgBlue.black(' INFO '), msg))
}

exports.success = msg => {
  console.log(format(chalk.bgGreen.black('  OK  '), msg))
}

exports.warn = msg => {
  console.warn(format(chalk.bgYellow.black(' WARN '), chalk.yellow(msg)))
}

exports.error = (msg) => {
  console.error(format(chalk.bgRed(' ERROR '), chalk.red(msg)))
  if (msg instanceof Error) {
    console.error(msg.stack)
  }
}

exports.clearConsole = title => {
  if (process.stdout.isTTY) {
    process.stdout.write(
      process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H'
    )
    if (title) {
      console.log(title)
    }
  }
}

exports.hasYarn = (() => {
  try {
    require('child_process').execSync('yarnpkg --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
})()
