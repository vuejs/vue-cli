const { URL } = require('url')
const https = require('https')
const chalk = require('chalk')
const inquirer = require('inquirer')
const { promisify } = require('util')
const { spawn, exec } = require('child_process')
const { savePartialOptions } = require('../options')
const { stopSpinner, logWithSpinner } = require('@vue/cli-shared-utils')

const taobaoRegistry = 'https://registry.npm.taobao.org'
const taobaoDistURL = 'https://npm.taobao.org/dist'
const defaultRegistry = {
  npm: 'https://registry.npmjs.org',
  yarn: 'https://registry.yarnpkg.com'
}

const ping = promisify((host, cb) => {
  const start = Date.now()
  const req = https.request({
    hostname: new URL(host).hostname
  }, () => {
    cb(null, Date.now() - start)
  })
  req.on('error', cb)
  req.end()
})

const checkRegistrySwitch = async (command) => {
  const { stdout } = await promisify(exec)(`${command} config get registry`)
  const currentRegistry = stdout.toString().trim()
  // if user has set custom registry, ignore
  if (currentRegistry.replace(/\/$/, '') !== defaultRegistry[command]) {
    return false
  }
  const latency = await ping(currentRegistry)
  if (latency > 10) {
    const tbLatency = 1//await ping(taobaoRegistry)
    if (tbLatency < latency) {
      stopSpinner(false)
      console.log()
      const { use } = await inquirer.prompt([{
        name: 'use',
        type: 'confirm',
        message: chalk.yellow(
          ` Your connection to the default ${command} registry is quite slow (${chalk.red(`${latency}ms`)}).\n` +
          `   Use the Taobao mirror (${chalk.green(`${tbLatency}ms`)}) for faster installation?`
        )
      }])
      console.log()

      savePartialOptions({
        useTaobaoRegistry: use
      })

      logWithSpinner('⚙', `Installing CLI plugins. This might take a while...`)
      return use
    }
  }
}

let isFirstCall = false
let shouldUseTaobao
module.exports = async function installDeps (targetDir, options, deps) {
  const command = options.packageManager

  if (!isFirstCall) {
    isFirstCall = true
    shouldUseTaobao = typeof options.useTaobaoRegistry === 'boolean'
      ? options.useTaobaoRegistry
      : await checkRegistrySwitch(command)
  }

  await new Promise((resolve, reject) => {
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

    if (shouldUseTaobao) {
      args.push(`--registry=${taobaoRegistry}`)
      if (command === 'npm') {
        args.push(`--disturl=${taobaoDistURL}`)
      }
    }

    if (deps) {
      args.push.apply(args, deps)
    }

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
