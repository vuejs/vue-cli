const chalk = require('chalk')

const format = (label, msg) => {
  return msg.split('\n').map((line, i) => {
    return i === 0
      ? `\n  ${label} ${line}`
      : `  ${line}`
  }).join('\n') + '\n'
}

exports.success = msg => {
  console.log(format(chalk.bgGreen(' OK '), chalk.green(msg)))
}

exports.warn = msg => {
  console.warn(format(chalk.bgYellow(chalk.black(' WARN ')), chalk.yellow(msg)))
}

exports.error = msg => {
  console.error(format(chalk.bgRed(' ERROR '), chalk.red(msg)))
  if (msg instanceof Error) {
    console.error(msg.stack)
  }
  process.exit(1)
}
