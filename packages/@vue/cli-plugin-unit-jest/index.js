module.exports = api => {
  api.registerCommand('test', {
    description: 'run unit tests with jest',
    usage: 'vue-cli-service test [options] <regexForTestFiles>',
    options: {
      '--watch': 'run tests in watch mode'
    },
    details:
      `All jest command line options are supported.\n` +
      `See https://facebook.github.io/jest/docs/en/cli.html for more details.`
  }, (args, rawArgv) => {
    api.setMode('test')
    // for @vue/babel-preset-app
    process.env.VUE_CLI_BABEL_TARGET_NODE = true
    process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true

    const execa = require('execa')
    const jestBinPath = require.resolve('jest/bin/jest')

    let testMatch = []
    if (!args._.length && !api.service.pkg.jest.testMatch) {
      testMatch = [`--testMatch`, `<rootDir>/(tests/unit/**/*.spec.(ts|tsx|js)|**/__tests__/*.(ts|tsx|js))`]
    }

    const argv = [
      ...rawArgv,
      ...testMatch
    ]

    return new Promise((resolve, reject) => {
      const child = execa(jestBinPath, argv, {
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
}
