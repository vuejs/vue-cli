const {
  hasYarn
} = require('@vue/cli-shared-utils')
const { loadOptions } = require('@vue/cli/lib/options')

exports.getCommand = function () {
  return loadOptions().packageManager || (hasYarn() ? 'yarn' : 'npm')
}
