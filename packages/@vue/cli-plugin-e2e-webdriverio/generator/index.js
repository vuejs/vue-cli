const { installedBrowsers } = require('@vue/cli-shared-utils')

const applyTS = module.exports.applyTS = (api, invoking) => {
  api.extendPackage({
    devDependencies: {
      '@types/mocha': '^8.0.1'
    }
  })

  // inject types to tsconfig.json
  if (invoking) {
    api.render(files => {
      const tsconfig = files['tsconfig.json']
      if (tsconfig) {
        const parsed = JSON.parse(tsconfig)
        const types = parsed.compilerOptions.types
        if (types) {
          for (const t of ['mocha', '@wdio/mocha-framework', '@wdio/sync']) {
            if (!types.includes(t)) {
              types.push(t)
            }
          }
        }
        files['tsconfig.json'] = JSON.stringify(parsed, null, 2)
      }
    })
  }
}

module.exports = (api, { webdrivers }, rootOptions, invoking) => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript'),
    hasESLint: api.hasPlugin('eslint')
  })

  const devDependencies = {}

  // Use devDependencies to store latest version number so as to automate update
  const pluginDeps = require('../package.json').devDependencies

  if (api.hasPlugin('typescript')) {
    devDependencies['ts-node'] = pluginDeps['ts-node']
  }

  if (webdrivers && webdrivers.includes('firefox')) {
    devDependencies.geckodriver = pluginDeps.geckodriver
    devDependencies['wdio-geckodriver-service'] = pluginDeps['wdio-geckodriver-service']
  }
  if (webdrivers && webdrivers.includes('chrome')) {
    // chromedriver major version bumps every 6 weeks following Chrome
    // so there may be a mismatch between
    // user's installed browser version and the default provided version
    // fallback to the devDependencies version in case detection fails
    devDependencies['wdio-chromedriver-service'] = pluginDeps['wdio-chromedriver-service']
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

  if (api.hasPlugin('typescript')) {
    applyTS(api, invoking)
  }
}
