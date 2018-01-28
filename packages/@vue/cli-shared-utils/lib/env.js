const { execSync } = require('child_process')

// env detection
exports.hasYarn = (() => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
})()

exports.hasGit = () => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  try {
    execSync('git --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}
