const { installedBrowsers } = require('@vue/cli-shared-utils')

module.exports = (api, { webdrivers }) => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript'),
    hasESLint: api.hasPlugin('eslint')
  })

  const devDependencies = {}

  // Use devDependencies to store latest version number so as to automate update
  const pluginDeps = require('../package.json').devDependencies

  if (webdrivers && webdrivers.includes('firefox')) {
    devDependencies.geckodriver = pluginDeps.geckodriver
  }
  if (webdrivers && webdrivers.includes('chrome')) {
    // chromedriver major version bumps every 6 weeks following Chrome
    // so there may be a mismatch between
    // user's installed browser version and the default provided version
    // fallback to the devDependencies version in case detection fails
    devDependencies.chromedriver = installedBrowsers.chrome
      ? installedBrowsers.chrome.match(/^(\d+)\./)[1]
      : pluginDeps.chromedriver
  }

  api.extendPackage({
    scripts: {
      'test:e2e': 'vue-cli-service test:e2e'
    },
    devDependencies
  })
}
