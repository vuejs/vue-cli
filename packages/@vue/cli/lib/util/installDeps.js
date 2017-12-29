const { spawn } = require('child_process')

module.exports = function installDeps (command, targetDir, deps) {
  return new Promise((resolve, reject) => {
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
    if (deps) {
      args.push.apply(args, deps)
    }

    const child = spawn(command, args, {
      cwd: targetDir,
      stdio: 'inherit'
    })
    child.on('close', code => {
      if (code !== 0) {
        return reject(
          `command failed: ${command} ${args.join(' ')}`
        )
      }
      resolve()
    })
  })
}
