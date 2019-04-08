const {
  hasYarn,
  hasProjectYarn,
  hasPnpm
} = require('@vue/cli-shared-utils')
const { loadOptions } = require('@vue/cli/lib/options')

exports.getCommand = function (cwd = undefined) {
  if (!cwd) {
    return loadOptions().packageManager || (hasYarn() ? 'yarn' : hasPnpm() ? 'pnpm' : 'npm')
  }
  return hasProjectYarn(cwd) ? 'yarn' : hasPnpm() ? 'pnpm' : 'npm'
}
