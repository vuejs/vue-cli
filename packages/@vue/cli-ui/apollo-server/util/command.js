const {
  hasYarn,
  hasProjectYarn
} = require('@vue/cli-shared-utils')
const { loadOptions } = require('@vue/cli/lib/options')

exports.getCommand = function (cwd = undefined) {
  if (!cwd) {
    return loadOptions().packageManager || (hasYarn() ? 'yarn' : 'npm')
  }
  return hasProjectYarn(cwd) ? 'yarn' : 'npm'
}
