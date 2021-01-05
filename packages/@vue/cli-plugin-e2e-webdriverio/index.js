const fs = require('fs')
const path = require('path')

const { info, chalk, execa } = require('@vue/cli-shared-utils')
const { cmdArgs } = require('@wdio/cli/build/commands/run')

const CLI_OPTIONS = Object.entries(cmdArgs).reduce((obj, [param, { desc }]) => {
  obj[`--${param}`] = desc
  return obj
}, {})

/** @type {import('@vue/cli-service').ServicePlugin} */
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

      const isTS = fs.existsSync(path.join(api.getCwd(), 'tsconfig.json'))
      const configFile = !args.remote
        ? path.join(api.getCwd(), 'wdio.local.conf.' + (isTS ? 'ts' : 'js'))
        : path.join(api.getCwd(), 'wdio.sauce.conf.' + (isTS ? 'ts' : 'js'))
      const wdioBinPath = require.resolve('@wdio/cli/bin/wdio')

      if (isTS) {
        // make sure ts-node runs with commonjs format, as it does not support esm
        process.env.TS_NODE_COMPILER_OPTIONS = '{ "module": "commonjs" }'
      }

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
