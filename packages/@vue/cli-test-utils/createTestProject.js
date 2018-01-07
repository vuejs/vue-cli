const fs = require('fs')
const path = require('path')
const execa = require('execa')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdirp = promisify(require('mkdirp'))

module.exports = function createTestProject (name, config, cwd) {
  cwd = cwd || path.resolve(__dirname, '../../test')

  config = Object.assign({
    packageManager: 'yarn',
    useTaobaoRegistry: false,
    plugins: {}
  }, config)

  const projectRoot = path.resolve(cwd, name)

  const read = file => {
    return readFile(path.resolve(projectRoot, file), 'utf-8')
  }

  const write = (file, content) => {
    const targetPath = path.resolve(projectRoot, file)
    const dir = path.dirname(targetPath)
    return mkdirp(dir).then(() => writeFile(targetPath, content))
  }

  const run = (command, args) => {
    if (!args) { [command, ...args] = command.split(/\s+/) }
    const child = execa(command, args, { cwd: projectRoot })
    child.then(({ code, stderr }) => {
      if (code !== 0 && stderr) console.error(stderr)
    })
    return child
  }

  const cliBinPath = require.resolve('@vue/cli/bin/vue')

  const args = [
    'create',
    name,
    '--force',
    '--config',
    JSON.stringify(config)
  ]

  const options = {
    cwd,
    stdio: 'inherit'
  }

  return execa(cliBinPath, args, options).then(() => ({
    dir: projectRoot,
    read,
    write,
    run
  }))
}
