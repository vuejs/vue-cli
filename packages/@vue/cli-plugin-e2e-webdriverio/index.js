const path = require('path')

const { info, chalk, execa } = require('@vue/cli-shared-utils')
const { cmdArgs } = require('@wdio/cli/build/commands/run')

const CLI_OPTIONS = Object.entries(cmdArgs).reduce((obj, [param, { desc }]) => {
  obj[`--${param}`] = desc
  return obj
}, {})

module.exports = (api, options) => {
  api.registerCommand('test:e2e', {
    description: 'run end-to-end tests with WebdriverIO',
    usage: 'vue-cli-service test:e2e [options]',
    options: {
      '--remote': 'Run tests remotely on SauceLabs',
      '--headless': 'Run tests headless',
      ...CLI_OPTIONS
    },
    details:
      `All WebdriverIO CLI options are also supported.\n` +
      chalk.yellow(`https://webdriver.io/docs/clioptions.html`)
  }, (args, rawArgs) => {
    return Promise.all([
      startDevServer(args, api)
    ]).then((results) => {
      const { server, url } = results[0]
      info(`Running end-to-end tests...`)

      // expose dev server url to tests
      if (!args.baseUrl) {
        rawArgs.push(`--baseUrl=${url}`)
      }

      const configFile = !args.remote
        ? path.join(process.cwd(), 'tests', 'wdio.local.conf.js')
        : path.join(process.cwd(), 'tests', 'wdio.sauce.conf.js')
      const wdioBinPath = require.resolve('@wdio/cli/bin/wdio')

      const runArgs = ['run', configFile, ...rawArgs]
      info(`Start WebdriverIO: $ wdio ${runArgs.join(' ')}`)
      const runner = execa(wdioBinPath, runArgs, { stdio: 'inherit' })
      if (server) {
        runner.on('exit', () => server.close())
        runner.on('error', () => server.close())
      }

      if (process.env.VUE_CLI_TEST) {
        runner.on('exit', code => {
          process.exit(code)
        })
      }

      return runner
    })
  })
}

module.exports.defaultModes = {
  'test:e2e': 'production'
}

function startDevServer (args, api) {
  const { baseUrl } = args

  if (baseUrl) {
    return Promise.resolve({ baseUrl })
  }

  return api.service.run('serve')
}
