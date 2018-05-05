module.exports = api => {
  api.registerCommand('test:unit', {
    description: 'run unit tests with jest',
    usage: 'vue-cli-service test:unit [options] <regexForTestFiles>',
    options: {
      '--watch': 'run tests in watch mode'
    },
    details:
      `All jest command line options are supported.\n` +
      `See https://facebook.github.io/jest/docs/en/cli.html for more details.`
  }, (args, rawArgv) => {
    // for @vue/babel-preset-app
    process.env.VUE_CLI_BABEL_TARGET_NODE = true
    process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true

    const execa = require('execa')
    const jestBinPath = require.resolve('jest/bin/jest')

    return new Promise((resolve, reject) => {
      const child = execa(jestBinPath, rawArgv, {
        cwd: api.resolve('.'),
        stdio: 'inherit'
      })
      child.on('error', reject)
      child.on('exit', code => {
        if (code !== 0) {
          reject(`jest exited with code ${code}.`)
        } else {
          resolve()
        }
      })
    })
  })

  // TODO remove in RC
  api.registerCommand('test', (args, rawArgv) => {
    const { warn } = require('@vue/cli-shared-utils')
    warn(`Deprecation Warning: "vue-cli-service test" has been renamed to "vue-cli-service test:unit".`)
    return api.service.run('test:unit', args, rawArgv)
  })
}

module.exports.defaultModes = {
  'test:unit': 'test'
}
