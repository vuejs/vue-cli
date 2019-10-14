const {
  hasYarn,
  hasProjectYarn,
  hasPnpmXOrLater,
  hasProjectPnpm
} = require('@vue/cli-shared-utils')
const { loadOptions } = require('@vue/cli/lib/options')

exports.getCommand = function (cwd = undefined) {
  if (!cwd) {
    return loadOptions().packageManager || (hasYarn() ? 'yarn' : hasPnpmXOrLater('3.0.0') ? 'pnpm' : 'npm')
  }
  return hasProjectYarn(cwd) ? 'yarn' : hasProjectPnpm(cwd) ? 'pnpm' : 'npm'
}
