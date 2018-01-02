const { URL } = require('url')
const https = require('https')
const chalk = require('chalk')
const { promisify } = require('util')
const { spawn, exec } = require('child_process')
const execAsync = promisify(exec)
const { info } = require('@vue/cli-shared-utils')

const taobaoRegistry = 'https://registry.npm.taobao.org'
const taobaoDistURL = 'https://npm.taobao.org/dist'
const defaultRegistry = {
  npm: 'https://registry.npmjs.org',
  yarn: 'https://registry.yarnpkg.com'
}

let pinged = false
let shouldUseTaobao = false

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

const checkLatency = async (command) => {
  pinged = true
  const { stdout } = await execAsync(`${command} config get registry`)
  const currentRegistry = stdout.toString().trim()
  // if user has set custom registry, ignore
  if (currentRegistry.replace(/\/$/, '') !== defaultRegistry[command]) {
    return
  }
  const latency = await ping(currentRegistry)
  if (latency > 1000) {
    const tbLatency = await ping(taobaoRegistry)
    if (tbLatency < latency) {
      console.log('\n')
      info(`Your connection to the default ${command} registry is quite slow.`)
      info(`Automatically using the Taobao mirror for faster installation.`)
      info(`Consider changing your registry config by running:`)
      info(``)
      info(chalk.cyan(`  ${command} config set registry ${taobaoRegistry}`))
      if (command === 'npm') {
        info(chalk.cyan(`  ${command} config set disturl ${taobaoDistURL}`))
      }
      console.log()
      shouldUseTaobao = true
    }
  }
}

module.exports = async function installDeps (command, targetDir, deps) {
  if (!pinged) {
    await checkLatency(command)
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
