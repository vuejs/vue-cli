const joi = require('joi')
const chalk = require('chalk')
const spinner = require('./spinner')
const readline = require('readline')
const { execSync } = require('child_process')
const padStart = require('string.prototype.padstart')

const format = (label, msg) => {
  return msg.split('\n').map((line, i) => {
    return i === 0
      ? `${label} ${line}`
      : padStart(line, chalk.reset(label).length)
  }).join('\n')
}

Object.assign(exports, spinner)

exports.log = msg => console.log(msg || '')

exports.info = msg => {
  console.log(format(chalk.bgBlue.black(' INFO '), msg))
}

exports.done = msg => {
  console.log(format(chalk.bgGreen.black(' DONE '), msg))
}

exports.warn = msg => {
  console.warn(format(chalk.bgYellow.black(' WARN '), chalk.yellow(msg)))
}

exports.error = msg => {
  console.error(format(chalk.bgRed(' ERROR '), chalk.red(msg)))
  if (msg instanceof Error) {
    console.error(msg.stack)
  }
}

exports.clearConsole = title => {
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows)
    console.log(blank)
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)
    if (title) {
      console.log(title)
    }
  }
}

// silent all logs except errors during tests and keep record
if (process.env.VUE_CLI_TEST) {
  const logs = {}
  Object.keys(exports).forEach(key => {
    if (key !== 'error') {
      exports[key] = (...args) => {
        if (!logs[key]) logs[key] = []
        logs[key].push(args)
      }
    }
  })
  exports.logs = logs
}

// proxy to joi for option validation
exports.createSchema = fn => fn(joi)

exports.validate = (obj, schema) => {
  joi.validate(obj, schema, err => {
    if (err) {
      throw err
    }
  })
}

// env detection
exports.hasYarn = (() => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
})()

exports.hasGit = () => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  try {
    execSync('git --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}
