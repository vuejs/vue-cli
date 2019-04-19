const EventEmitter = require('events')
const chalk = require('chalk')
const execa = require('execa')
const readline = require('readline')
const registries = require('./registries')
const shouldUseTaobao = require('./shouldUseTaobao')

const debug = require('debug')('vue-cli:install')

const taobaoDistURL = 'https://npm.taobao.org/dist'

const supportPackageManagerList = ['npm', 'yarn', 'pnpm']

class InstallProgress extends EventEmitter {
  constructor () {
    super()

    this._progress = -1
  }

  get progress () {
    return this._progress
  }

  set progress (value) {
    this._progress = value
    this.emit('progress', value)
  }

  get enabled () {
    return this._progress !== -1
  }

  set enabled (value) {
    this.progress = value ? 0 : -1
  }

  log (value) {
    this.emit('log', value)
  }
}

const progress = exports.progress = new InstallProgress()

function toStartOfLine (stream) {
  if (!chalk.supportsColor) {
    stream.write('\r')
    return
  }
  readline.cursorTo(stream, 0)
}

function checkPackageManagerIsSupported (command) {
  if (supportPackageManagerList.indexOf(command) === -1) {
    throw new Error(`Unknown package manager: ${command}`)
  }
}

function renderProgressBar (curr, total) {
  const ratio = Math.min(Math.max(curr / total, 0), 1)
  const bar = ` ${curr}/${total}`
  const availableSpace = Math.max(0, process.stderr.columns - bar.length - 3)
  const width = Math.min(total, availableSpace)
  const completeLength = Math.round(width * ratio)
  const complete = `#`.repeat(completeLength)
  const incomplete = `-`.repeat(width - completeLength)
  toStartOfLine(process.stderr)
  process.stderr.write(`[${complete}${incomplete}]${bar}`)
}

async function addRegistryToArgs (command, args, cliRegistry) {
  const altRegistry = (
    cliRegistry || (
      (await shouldUseTaobao(command))
        ? registries.taobao
        : null
    )
  )

  if (altRegistry) {
    args.push(`--registry=${altRegistry}`)
    if (altRegistry === registries.taobao) {
      args.push(`--disturl=${taobaoDistURL}`)
    }
  }
}

function executeCommand (command, args, targetDir) {
  return new Promise((resolve, reject) => {
    const apiMode = process.env.VUE_CLI_API_MODE

    progress.enabled = false

    if (apiMode) {
      if (command === 'npm') {
        // TODO when this is supported
      } else if (command === 'yarn') {
        args.push('--json')
      }
    }

    const child = execa(command, args, {
      cwd: targetDir,
      stdio: ['inherit', apiMode ? 'pipe' : 'inherit', !apiMode && command === 'yarn' ? 'pipe' : 'inherit']
    })

    if (apiMode) {
      let progressTotal = 0
      let progressTime = Date.now()
      child.stdout.on('data', buffer => {
        let str = buffer.toString().trim()
        if (str && command === 'yarn' && str.indexOf('"type":') !== -1) {
          const newLineIndex = str.lastIndexOf('\n')
          if (newLineIndex !== -1) {
            str = str.substr(newLineIndex)
          }
          try {
            const data = JSON.parse(str)
            if (data.type === 'step') {
              progress.enabled = false
              progress.log(data.data.message)
            } else if (data.type === 'progressStart') {
              progressTotal = data.data.total
            } else if (data.type === 'progressTick') {
              const time = Date.now()
              if (time - progressTime > 20) {
                progressTime = time
                progress.progress = data.data.current / progressTotal
              }
            } else {
              progress.enabled = false
            }
          } catch (e) {
            console.error(e)
            console.log(str)
          }
        } else {
          process.stdout.write(buffer)
        }
      })
    } else {
      // filter out unwanted yarn output
      if (command === 'yarn') {
        child.stderr.on('data', buf => {
          const str = buf.toString()
          if (/warning/.test(str)) {
            return
          }

          // progress bar
          const progressBarMatch = str.match(/\[.*\] (\d+)\/(\d+)/)
          if (progressBarMatch) {
            // since yarn is in a child process, it's unable to get the width of
            // the terminal. reimplement the progress bar ourselves!
            renderProgressBar(progressBarMatch[1], progressBarMatch[2])
            return
          }

          process.stderr.write(buf)
        })
      }
    }

    child.on('close', code => {
      if (code !== 0) {
        reject(`command failed: ${command} ${args.join(' ')}`)
        return
      }
      resolve()
    })
  })
}

exports.installDeps = async function installDeps (targetDir, command, cliRegistry) {
  checkPackageManagerIsSupported(command)

  const args = []

  if (command === 'npm' || command === 'pnpm') {
    args.push('install', '--loglevel', 'error')
  } else if (command === 'yarn') {
    // do nothing
  }

  if (command === 'pnpm') {
    args.push('--shamefully-flatten')
  }

  await addRegistryToArgs(command, args, cliRegistry)

  debug(`command: `, command)
  debug(`args: `, args)

  await executeCommand(command, args, targetDir)
}

exports.installPackage = async function (targetDir, command, cliRegistry, packageName, dev = true) {
  checkPackageManagerIsSupported(command)

  const args = []

  if (command === 'npm' || command === 'pnpm') {
    args.push('install', '--loglevel', 'error')
  } else if (command === 'yarn') {
    args.push('add')
  }

  if (dev) args.push('-D')

  await addRegistryToArgs(command, args, cliRegistry)

  args.push(packageName)

  debug(`command: `, command)
  debug(`args: `, args)

  await executeCommand(command, args, targetDir)
}

exports.uninstallPackage = async function (targetDir, command, cliRegistry, packageName) {
  checkPackageManagerIsSupported(command)

  const args = []

  if (command === 'npm' || command === 'pnpm') {
    args.push('uninstall', '--loglevel', 'error')
  } else if (command === 'yarn') {
    args.push('remove')
  }

  await addRegistryToArgs(command, args, cliRegistry)

  args.push(packageName)

  debug(`command: `, command)
  debug(`args: `, args)

  await executeCommand(command, args, targetDir)
}

exports.updatePackage = async function (targetDir, command, cliRegistry, packageName) {
  checkPackageManagerIsSupported(command)

  const args = []

  if (command === 'npm' || command === 'pnpm') {
    args.push('update', '--loglevel', 'error')
  } else if (command === 'yarn') {
    args.push('upgrade')
  }

  await addRegistryToArgs(command, args, cliRegistry)

  packageName.split(' ').forEach(name => args.push(name))

  debug(`command: `, command)
  debug(`args: `, args)

  await executeCommand(command, args, targetDir)
}
