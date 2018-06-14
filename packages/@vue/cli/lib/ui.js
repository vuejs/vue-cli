const { log, error, openBrowser } = require('@vue/cli-shared-utils')
const { portfinder, server } = require('@vue/cli-ui/server')
const shortid = require('shortid')

async function ui (options = {}, context = process.cwd()) {
  let port = options.port
  if (!port) {
    port = await portfinder.getPortPromise()
  }

  // Config
  process.env.VUE_APP_CLI_UI_URL = ''

  // Optimize express
  const nodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'

  // Dev mode
  if (options.dev) {
    process.env.VUE_CLI_UI_DEV = true
  }

  if (!process.env.VUE_CLI_IPC) {
    // Prevent IPC id conflicts
    process.env.VUE_CLI_IPC = `vue-cli-${shortid()}`
  }

  if (!options.quiet) log(`🚀  Starting GUI...`)

  const opts = {
    port,
    graphqlPath: '/graphql',
    graphqlSubscriptionsPath: '/graphql',
    graphqlPlaygroundPath: '/graphql-playground',
    graphqlCors: '*',
    mock: false,
    apolloEngine: false,
    timeout: 1000000,
    quiet: true,
    paths: {
      typeDefs: require.resolve('@vue/cli-ui/src/graphql-api/type-defs.js'),
      resolvers: require.resolve('@vue/cli-ui/src/graphql-api/resolvers.js'),
      context: require.resolve('@vue/cli-ui/src/graphql-api/context.js'),
      pubsub: require.resolve('@vue/cli-ui/src/graphql-api/pubsub.js'),
      server: require.resolve('@vue/cli-ui/src/graphql-api/server.js'),
      directives: require.resolve('@vue/cli-ui/src/graphql-api/directives.js')
    }
  }

  server(opts, () => {
    // Reset for yarn/npm to work correctly
    if (typeof nodeEnv === 'undefined') {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = nodeEnv
    }

    // Open browser
    const url = `http://localhost:${port}`
    if (!options.quiet) log(`🌠  Ready on ${url}`)
    if (options.headless) {
      console.log(port)
    } else {
      openBrowser(url)
    }
  })
}

module.exports = (...args) => {
  return ui(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
