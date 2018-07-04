const {
  hasYarn
} = require('@vue/cli-shared-utils')
const { loadOptions } = require('@vue/cli/lib/options')

exports.getCommand = function (context) {
  return loadOptions().packageManager || (hasYarn(context) ? 'yarn' : 'npm')
}
