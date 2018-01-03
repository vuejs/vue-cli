const { URL } = require('url')
const https = require('https')
const chalk = require('chalk')
const inquirer = require('inquirer')
const { promisify } = require('util')
const { spawn, exec } = require('child_process')
const { loadOptions, saveOptions } = require('../options')
const { pauseSpinner, resumeSpinner } = require('@vue/cli-shared-utils')

const debug = require('debug')('vue-cli:install')

const registries = {
  npm: 'https://registry.npmjs.org',
  yarn: 'https://registry.yarnpkg.com',
  taobao: 'https://registry.npm.taobao.org'
}
const taobaoDistURL = 'https://npm.taobao.org/dist'

const ping = url => new Promise((resolve, reject) => {
  const req = https.request({
    hostname: new URL(url).hostname,
    path: '/vue/latest'
  }, () => {
    resolve(url)
  })
  req.on('error', reject)
  req.end()
})

let checked
let result
const shouldUseTaobao = async (command) => {
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

  const configValue = await promisify(exec)(`${command} config get registry`)
  const userCurrent = configValue.stdout.toString().trim()
  const defaultRegistry = registries[command]
  if (userCurrent !== defaultRegistry) {
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
      ` Your connection to the the default ${command} registry seems to be slow.\n` +
      `   Use ${chalk.cyan(registries.taobao)} for faster installation?`
    )
  }])
  resumeSpinner()
  return save(useTaobaoRegistry)
}

module.exports = async function installDeps (targetDir, command, deps, cliRegistry) {
  const args = []
  if (command === 'npm') {
    args.push('install', '--loglevel', 'error')
    if (deps) {
      args.push('--save-dev')
    }
  } else if (command === 'yarn') {
    if (deps) {
      args.push('add', '--dev')
    }
  } else {
    throw new Error(`unknown package manager: ${command}`)
  }

  const altRegistry = (
    cliRegistry || (
      (await shouldUseTaobao(command))
        ? registries.taobao
        : null
    )
  )

  if (altRegistry) {
    args.push(`--registry=${altRegistry}`)
    if (command === 'npm' && altRegistry === registries.taobao) {
      args.push(`--disturl=${taobaoDistURL}`)
    }
  }

  if (deps) {
    args.push.apply(args, deps)
  }

  debug(`command: `, command)
  debug(`args: `, args)

  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: targetDir,
      stdio: 'pipe'
    })

    let stderr = ''
    child.stderr.on('data', buf => {
      stderr += buf.toString()
    })

    child.on('close', code => {
      if (code !== 0) {
        reject(
          `command failed: ${command} ${args.join(' ')}\n` +
          stderr
        )
        return
      }
      resolve()
    })
  })
}
