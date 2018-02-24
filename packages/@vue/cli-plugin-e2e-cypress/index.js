function removeArg (rawArgs, arg) {
  const matchRE = new RegExp(`^--${arg}`)
  const equalRE = new RegExp(`^--${arg}=`)
  const i = rawArgs.findIndex(arg => matchRE.test(arg))
  if (i > -1) {
    rawArgs.splice(i, equalRE.test(rawArgs[i]) ? 1 : 2)
  }
}

module.exports = (api, options) => {
  const chalk = require('chalk')

  function run (command, args, rawArgs) {
    removeArg(rawArgs, 'url')
    removeArg(rawArgs, 'mode')

    const serverPromise = args.url
      ? Promise.resolve({ url: args.url })
      : api.service.run('serve', { mode: args.mode || 'production' })

    return serverPromise.then(({ url, server }) => {
      const { info } = require('@vue/cli-shared-utils')
      info(`Starting e2e tests...`)

      const cyArgs = [
        command, // open or run
        '--config', `baseUrl=${url}`,
        ...rawArgs
      ]

      const execa = require('execa')
      const cypressBinPath = require.resolve('cypress/bin/cypress')
      const runner = execa(cypressBinPath, cyArgs, { stdio: 'inherit' })
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
  }

  const commandOptions = {
    '--mode': 'specify the mode the dev server should run in. (default: production)',
    '--url': 'run e2e tests against given url instead of auto-starting dev server'
  }

  api.registerCommand('e2e', {
    description: 'run e2e tests headlessly with `cypress run`',
    usage: 'vue-cli-service e2e [options]',
    options: Object.assign({
      '-s, --spec': 'runs a specific spec file. defaults to "all"'
    }, commandOptions),
    details:
      `All Cypress CLI options are also supported:\n` +
      chalk.yellow(`https://docs.cypress.io/guides/guides/command-line.html#cypress-run`)
  }, (args, rawArgs) => run('run', args, rawArgs))

  api.registerCommand('e2e:open', {
    description: 'run e2e tests in interactive mode with `cypress open`',
    usage: 'vue-cli-service e2e:open [options]',
    options: commandOptions,
    details:
      `All Cypress CLI options are supported:\n` +
      chalk.yellow(`https://docs.cypress.io/guides/guides/command-line.html#cypress-open`)
  }, (args, rawArgs) => run('open', args, rawArgs))
}
