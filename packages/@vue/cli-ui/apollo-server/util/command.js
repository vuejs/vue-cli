const {
  hasYarn,
  hasProjectYarn,
  hasPnpm3OrLater,
  hasProjectPnpm
} = require('@vue/cli-shared-utils')
const { loadOptions } = require('@vue/cli/lib/options')

exports.getCommand = function (cwd = undefined) {
  if (!cwd) {
    return loadOptions().packageManager || (hasYarn() ? 'yarn' : hasPnpm3OrLater() ? 'pnpm' : 'npm')
  }
  return hasProjectYarn(cwd) ? 'yarn' : hasProjectPnpm(cwd) ? 'pnpm' : 'npm'
}
