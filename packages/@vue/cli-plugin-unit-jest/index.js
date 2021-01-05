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
    // for @vue/babel-preset-app <= v4.0.0-rc.7
    process.env.VUE_CLI_BABEL_TARGET_NODE = true
    process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true
    require('jest').run(rawArgv)
  })
}

module.exports.defaultModes = {
  'test:unit': 'test'
}
