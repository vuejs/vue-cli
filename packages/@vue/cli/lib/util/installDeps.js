const axios = require('axios')
const chalk = require('chalk')
const execa = require('execa')
const readline = require('readline')
const inquirer = require('inquirer')
const { loadOptions, saveOptions } = require('../options')
const { pauseSpinner, resumeSpinner } = require('@vue/cli-shared-utils')

const debug = require('debug')('vue-cli:install')

const registries = {
  npm: 'https://registry.npmjs.org',
  yarn: 'https://registry.yarnpkg.com',
  taobao: 'https://registry.npm.taobao.org'
}
const taobaoDistURL = 'https://npm.taobao.org/dist'

async function ping (registry) {
  await axios.get(`${registry}/vue-cli-version-marker/latest`)
  return registry
}

function removeSlash (url) {
  return url.replace(/\/$/, '')
}

let checked
let result
async function shouldUseTaobao () {
  // ensure this only gets called once.
  if (checked) return result
  checked = true

  // previously saved preference
  const saved = loadOptions().useTaobaoRegistry
  if (typeof saved === 'boolean') {
    return (result = saved)
  }

  const save = val => {
    result = val
    saveOptions({ useTaobaoRegistry: val })
    return val
  }

  const userCurrent = (await execa(`npm`, ['config', 'get', 'registry'])).stdout
  const defaultRegistry = registries.npm
  if (removeSlash(userCurrent) !== removeSlash(defaultRegistry)) {
    // user has configured custom regsitry, respect that
    return save(false)
  }
  const faster = await Promise.race([
    ping(defaultRegistry),
    ping(registries.taobao)
  ])

  if (faster !== registries.taobao) {
    // default is already faster
    return save(false)
  }

  // ask and save preference
  pauseSpinner()
  const { useTaobaoRegistry } = await inquirer.prompt([{
    name: 'useTaobaoRegistry',
    type: 'confirm',
    message: chalk.yellow(
      ` Your connection to the the default npm registry seems to be slow.\n` +
      `   Use ${chalk.cyan(registries.taobao)} for faster installation?`
    )
  }])
  resumeSpinner()
  return save(useTaobaoRegistry)
}

function toStartOfLine (stream) {
  if (!chalk.supportsColor) {
    stream.write('\r')
    return
  }
  readline.cursorTo(stream, 0)
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

module.exports = async function installDeps (targetDir, command, cliRegistry) {
  const args = []
  if (command === 'npm') {
    args.push('install', '--loglevel', 'error')
  } else if (command === 'yarn') {
    // do nothing
  } else {
    throw new Error(`Unknown package manager: ${command}`)
  }

  if (command === 'yarn' && cliRegistry) {
    throw new Error(
      `Inline registry is not supported when using yarn. ` +
      `Please run \`yarn config set registry ${cliRegistry}\` before running @vue/cli.`
    )
  }

  const altRegistry = (
    cliRegistry || (
      (command === 'npm' && await shouldUseTaobao())
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

  debug(`command: `, command)
  debug(`args: `, args)

  await new Promise((resolve, reject) => {
    const child = execa(command, args, {
      cwd: targetDir,
      stdio: ['inherit', 'inherit', command === 'yarn' ? 'pipe' : 'inherit']
    })

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

    child.on('close', code => {
      if (code !== 0) {
        reject(`command failed: ${command} ${args.join(' ')}`)
        return
      }
      resolve()
    })
  })
}
