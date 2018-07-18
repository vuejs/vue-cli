const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

let _hasYarn
const _yarnProjects = new Map()
let _hasGit
const _gitProjects = new Map()

// env detection
exports.hasYarn = () => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  if (_hasYarn != null) {
    return _hasYarn
  }
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return (_hasYarn = true)
  } catch (e) {
    return (_hasYarn = false)
  }
}

exports.hasProjectYarn = (cwd) => {
  if (_yarnProjects.has(cwd)) {
    return checkYarn(_yarnProjects.get(cwd))
  }

  const lockFile = path.join(cwd, 'yarn.lock')
  const result = fs.existsSync(lockFile)
  _yarnProjects.set(cwd, result)
  return checkYarn(result)
}

function checkYarn (result) {
  if (result && !exports.hasYarn()) throw new Error(`The project seems to require yarn but it's not installed.`)
  return result
}

exports.hasGit = () => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  if (_hasGit != null) {
    return _hasGit
  }
  try {
    execSync('git --version', { stdio: 'ignore' })
    return (_hasGit = true)
  } catch (e) {
    return (_hasGit = false)
  }
}

exports.hasProjectGit = (cwd) => {
  if (_gitProjects.has(cwd)) {
    return _gitProjects.get(cwd)
  }

  let result
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  } catch (e) {
    result = false
  }
  _gitProjects.set(cwd, result)
  return result
}
