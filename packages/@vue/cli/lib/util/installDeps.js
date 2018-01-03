const { URL } = require('url')
const https = require('https')
const { spawn } = require('child_process')

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

const findFastestRegistry = () => {
  return Promise.race(Object.keys(registries).map(name => {
    return ping(registries[name])
  }))
}

let registry
module.exports = async function installDeps (targetDir, command, deps) {
  registry = registry || await findFastestRegistry()

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

    if (registry !== registries[command]) {
      args.push(`--registry=${registry}`)
      if (registry === 'npm' && registry === registries.taobao) {
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
