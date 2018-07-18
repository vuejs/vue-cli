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
    require('jest').run(rawArgv)
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
