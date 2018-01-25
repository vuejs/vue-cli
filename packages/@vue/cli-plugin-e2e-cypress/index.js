module.exports = (api, options) => {
  const chalk = require('chalk')

  function run (command, args, rawArgs) {
    if (args.url) {
      const i = rawArgs.findIndex(arg => /^--url/.test(arg))
      rawArgs.splice(i, /^--url=/.test(rawArgs[i]) ? 1 : 2)
    }

    const serverPromise = args.url
      ? Promise.resolve({ url: args.url })
      : api.service.run('serve', { mode: 'production' })

    return serverPromise.then(({ url, server }) => {
      const { info } = require('@vue/cli-shared-utils')
      info(`Starting e2e tests...`)

      const cyArgs = [
        command, // open or run
        '--env', `VUE_DEV_SERVER_URL=${url}`,
        ...rawArgs
      ]

      const execa = require('execa')
      const cypressBinPath = require.resolve('cypress/bin/cypress')
      const runner = execa(cypressBinPath, cyArgs, { stdio: 'inherit' })
      if (server) {
        runner.on('exit', () => server.close())
        runner.on('error', () => server.close())
      }
      return runner
    })
  }

  api.registerCommand('e2e', {
    description: 'run e2e tests headlessly with `cypress run`',
    usage: 'vue-cli-service e2e [options]',
    options: {
      '--url': 'run e2e tests against given url instead of auto-starting dev server',
      '-s, --spec': 'runs a specific spec file. defaults to "all"'
    },
    details:
      `All Cypress CLI options are also supported:\n` +
      chalk.yellow(`https://docs.cypress.io/guides/guides/command-line.html#cypress-run`)
  }, (args, rawArgs) => run('run', args, rawArgs))

  api.registerCommand('e2e:open', {
    description: 'run e2e tests in interactive mode with `cypress open`',
    usage: 'vue-cli-service e2e:open [options]',
    options: {
      '--url': 'run e2e tests against given url instead of auto-starting dev server'
    },
    details:
      `All Cypress CLI options are supported:\n` +
      chalk.yellow(`https://docs.cypress.io/guides/guides/command-line.html#cypress-open`)
  }, (args, rawArgs) => run('open', args, rawArgs))
}
