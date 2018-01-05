const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const childProcess = require('child_process')
const cliBinPath = require.resolve('@vue/cli/bin/vue')
const { spawn } = childProcess

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const _exec = promisify(childProcess.exec)
const mkdirp = promisify(require('mkdirp'))

module.exports = function createTestProjectWithOptions (name, config, cwd) {
  cwd = cwd || path.resolve(__dirname, '../../test')

  config = Object.assign({
    packageManager: 'yarn',
    useTaobaoRegistry: false,
    plugins: {}
  }, config)

  const read = file => {
    return readFile(path.resolve(cwd, name, file), 'utf-8')
  }

  const write = (file, content) => {
    const targetPath = path.resolve(cwd, name, file)
    const dir = path.dirname(targetPath)
    return mkdirp(dir).then(() => writeFile(targetPath, content))
  }

  const exec = command => {
    return _exec(command, { cwd: path.resolve(cwd, name) })
  }

  return new Promise((resolve, reject) => {
    const child = spawn(cliBinPath, [
      'create',
      name,
      '--force',
      '--config',
      JSON.stringify(config)
    ], {
      cwd,
      env: process.env,
      stdio: 'inherit'
    })

    child.on('exit', code => {
      if (code !== 0) {
        reject(`cli creation failed with code ${code}`)
      } else {
        resolve({
          read,
          write,
          exec
        })
      }
    })

    child.on('error', reject)
  })
}
