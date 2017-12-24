const chalk = require('chalk')

exports.info = msg => {
  console.log(chalk.gray(`\n  ${msg}\n`))
}

exports.success = msg => {
  console.log(chalk.green(`\n  ${msg}\n`))
}

exports.warn = msg => {
  console.warn(chalk.yellow(`\n  ${msg}\n`))
}

exports.error = msg => {
  console.error(`\n  ${chalk.bgRed(' ERROR ')} ${chalk.red(msg)}\n`)
  if (msg instanceof Error) {
    console.log(msg.stack)
  }
  process.exit(1)
}
