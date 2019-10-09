const { installedBrowsers } = require('@vue/cli-shared-utils')

module.exports = api => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript'),
    hasESLint: api.hasPlugin('eslint')
  })

  // Use devDependencies to store latest version number so as to automate update
  const devDeps = require('../package.json').devDependencies
  const geckodriver = devDeps.geckodriver

  // chromedriver major version bumps every 6 weeks following Chrome
  // so there may be a mismatch between
  // user's installed browser version and the default provided version
  // fallback to the devDependencies version in case detection fails
  const chromedriver = installedBrowsers.chrome
    ? installedBrowsers.chrome.match(/^(\d+)\./)[1]
    : devDeps.chromedriver

  api.extendPackage({
    scripts: {
      'test:e2e': 'vue-cli-service test:e2e'
    },
    devDependencies: {
      chromedriver,
      geckodriver
    }
  })
}
