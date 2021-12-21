const { log, error, openBrowser } = require('@vue/cli-shared-utils')
const { portfinder, server } = require('@vue/cli-ui/server')
const shortid = require('shortid')
const { setNotificationCallback } = require('@vue/cli-ui/apollo-server/util/notification')

function simpleCorsValidation (allowedHost) {
  return function (req, socket) {
    const { host, origin } = req.headers

    const safeOrigins = [
      host,
      allowedHost,
      'localhost'
    ]

    if (!origin || !safeOrigins.includes(new URL(origin).hostname)) {
      socket.destroy()
    }
  }
}

async function ui (options = {}, context = process.cwd()) {
  const host = options.host || 'localhost'

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
    process.env.VUE_APP_CLI_UI_DEBUG = true
  }

  if (!process.env.VUE_CLI_IPC) {
    // Prevent IPC id conflicts
    process.env.VUE_CLI_IPC = `vue-cli-${shortid()}`
  }

  if (!options.quiet) log(`🚀  Starting GUI...`)

  const opts = {
    host,
    port,
    graphqlPath: '/graphql',
    subscriptionsPath: '/graphql',
    enableMocks: false,
    enableEngine: false,
    cors: {
      origin: host
    },
    timeout: 1000000,
    quiet: true,
    paths: {
      typeDefs: require.resolve('@vue/cli-ui/apollo-server/type-defs.js'),
      resolvers: require.resolve('@vue/cli-ui/apollo-server/resolvers.js'),
      context: require.resolve('@vue/cli-ui/apollo-server/context.js'),
      pubsub: require.resolve('@vue/cli-ui/apollo-server/pubsub.js'),
      server: require.resolve('@vue/cli-ui/apollo-server/server.js'),
      directives: require.resolve('@vue/cli-ui/apollo-server/directives.js')
    }
  }

  const { httpServer } = server(opts, () => {
    // Reset for yarn/npm to work correctly
    if (typeof nodeEnv === 'undefined') {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = nodeEnv
    }

    // Open browser
    const url = `http://${host}:${port}`
    if (!options.quiet) log(`🌠  Ready on ${url}`)
    if (options.headless) {
      console.log(port)
    } else {
      setNotificationCallback(() => openBrowser(url))
      openBrowser(url)
    }
  })

  httpServer.on('upgrade', simpleCorsValidation(host))
}

module.exports = (...args) => {
  return ui(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
