const { execSync } = require('child_process')

const _hasYarn = new Map()
const _hasGit = new Map()

// env detection
exports.hasYarn = (context = undefined) => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  if (_hasYarn.has(context)) {
    return _hasYarn.get(context)
  }
  let result
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    result = true
  } catch (e) {
    result = false
  }
  _hasYarn.set(context, result)
  return result
}

exports.hasGit = (context = undefined) => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  if (_hasGit.has(context)) {
    return _hasGit.get(context)
  }
  let result
  try {
    execSync('git --version', { stdio: 'ignore', cwd: context })
    result = true
  } catch (e) {
    result = false
  }
  _hasGit.set(context, result)
  return result
}
