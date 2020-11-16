const { semver, loadModule } = require('@vue/cli-shared-utils')

module.exports = function getVersions (cwd) {
  const vue = loadModule('vue', cwd)
  // TODO: make Vue 3 the default version
  const vueMajor = vue ? semver.major(vue.version) : 2

  // TODO: need an option for npm users to use their own version of webpack
  const webpack = require('webpack')
  const webpackMajor = parseInt(webpack.version[0])

  return {
    vueMajor,
    webpackMajor
  }
}
