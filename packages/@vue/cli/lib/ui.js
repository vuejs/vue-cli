const { log, error, openBrowser } = require('@vue/cli-shared-utils')
const portfinder = require('portfinder')
const execa = require('execa')

async function ui (options = {}, context = process.cwd()) {
  log(`🚀  Starting GUI...`)

  let port = options.port
  if (!port) {
    port = await portfinder.getPortPromise()
  }

  const command = require.resolve('@vue/cli-service/bin/vue-cli-service')
  execa('cross-env', [
    'NODE_ENV=production',
    `VUE_APP_GRAPHQL_PORT=${port}`,
    'VUE_APP_GRAPHQL_ENDPOINT=',
    'VUE_APP_GRAPHQL_PLAYGROUND_PATH=/graphql-playground',
    'node',
    command,
    'ui'
  ], {
    cwd: context,
    stdio: ['inherit', 'inherit', 'inherit']
  })

  setTimeout(() => {
    openBrowser(`http://localhost:${port}`)
  }, 1000)
}

module.exports = (...args) => {
  return ui(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
