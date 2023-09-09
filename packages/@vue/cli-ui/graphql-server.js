// modified from vue-cli-plugin-apollo/graphql-server
// added a return value for the server() call

const http = require('http')
const { chalk } = require('@vue/cli-shared-utils')
const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const { PubSub } = require('graphql-subscriptions')
const merge = require('deepmerge')

const { SubscriptionServer } = require('subscriptions-transport-ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { execute, subscribe } = require('graphql')

function defaultValue (provided, value) {
  return provided == null ? value : provided
}

function autoCall (fn, ...context) {
  if (typeof fn === 'function') {
    return fn(...context)
  }
  return fn
}

module.exports = async (options, cb = null) => {
  // Default options
  options = merge({
    integratedEngine: false
  }, options)

  // Express app
  const app = express()
  const httpServer = http.createServer(app)

  // Customize those files
  let typeDefs = load(options.paths.typeDefs)
  const resolvers = load(options.paths.resolvers)
  const context = load(options.paths.context)
  const schemaDirectives = load(options.paths.directives)
  let pubsub
  try {
    pubsub = load(options.paths.pubsub)
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && !options.quiet) {
      console.log(chalk.yellow('Using default PubSub implementation for subscriptions.'))
      console.log(chalk.grey('You should provide a different implementation in production (for example with Redis) by exporting it in \'apollo-server/pubsub.js\'.'))
    }
  }
  let dataSources
  try {
    dataSources = load(options.paths.dataSources)
  } catch (e) {}

  // GraphQL API Server

  // Realtime subscriptions
  if (!pubsub) pubsub = new PubSub()

  // Customize server
  try {
    const serverModule = load(options.paths.server)
    serverModule(app)
  } catch (e) {
    // No file found
  }

  // Apollo server options

  typeDefs = processSchema(typeDefs)

  // eslint-disable-next-line prefer-const
  let subscriptionServer

  let apolloServerOptions = {
    typeDefs,
    resolvers,
    schemaDirectives,
    dataSources,
    tracing: true,
    cache: 'bounded',
    cacheControl: true,
    engine: !options.integratedEngine,
    // Resolvers context from POST
    context: async ({ req, connection }) => {
      let contextData
      try {
        if (connection) {
          contextData = await autoCall(context, { connection })
        } else {
          contextData = await autoCall(context, { req })
        }
      } catch (e) {
        console.error(e)
        throw e
      }
      contextData = Object.assign({}, contextData, { pubsub })
      return contextData
    },
    // Resolvers context from WebSocket
    plugins: [{
      async serverWillStart () {
        return {
          async drainServer () {
            subscriptionServer.close()
          }
        }
      }
    }]
  }

  // Automatic mocking
  if (options.enableMocks) {
    // Customize this file
    apolloServerOptions.mocks = load(options.paths.mocks)
    apolloServerOptions.mockEntireSchema = false

    if (!options.quiet) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Automatic mocking is enabled, consider disabling it with the \'enableMocks\' option.')
      } else {
        console.log('✔️  Automatic mocking is enabled')
      }
    }
  }

  // Apollo Engine
  if (options.enableEngine && options.integratedEngine) {
    if (options.engineKey) {
      apolloServerOptions.engine = {
        apiKey: options.engineKey,
        schemaTag: options.schemaTag,
        ...options.engineOptions || {}
      }
      console.log('✔️  Apollo Engine is enabled')
    } else if (!options.quiet) {
      console.log(chalk.yellow('Apollo Engine key not found.') + `To enable Engine, set the ${chalk.cyan('VUE_APP_APOLLO_ENGINE_KEY')} env variable.`)
      console.log('Create a key at https://engine.apollographql.com/')
      console.log('You may see `Error: Must provide document` errors (query persisting tries).')
    }
  } else {
    apolloServerOptions.engine = false
  }

  // Final options
  apolloServerOptions = merge(apolloServerOptions, defaultValue(options.serverOptions, {}))

  // Apollo Server
  const server = new ApolloServer(apolloServerOptions)

  const schema = makeExecutableSchema({
    typeDefs: apolloServerOptions.typeDefs,
    resolvers: apolloServerOptions.resolvers,
    schemaDirectives: apolloServerOptions.schemaDirectives
  })

  subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe,
    onConnect: async (connection, websocket) => {
      let contextData = {}
      try {
        contextData = await autoCall(context, {
          connection,
          websocket
        })
        contextData = Object.assign({}, contextData, { pubsub })
      } catch (e) {
        console.error(e)
        throw e
      }
      return contextData
    }
  }, {
    server: httpServer,
    path: options.subscriptionsPath
  })

  await server.start()

  // Express middleware
  server.applyMiddleware({
    app,
    path: options.graphqlPath,
    cors: options.cors
    // gui: {
    //   endpoint: graphqlPath,
    //   subscriptionEndpoint: graphqlSubscriptionsPath,
    // },
  })

  // Start server
  httpServer.setTimeout(options.timeout)

  httpServer.listen({
    host: options.host || 'localhost',
    port: options.port
  }, () => {
    if (!options.quiet) {
      console.log(`✔️  GraphQL Server is running on ${chalk.cyan(`http://localhost:${options.port}${options.graphqlPath}`)}`)
      if (process.env.NODE_ENV !== 'production' && !process.env.VUE_CLI_API_MODE) {
        console.log(`✔️  Type ${chalk.cyan('rs')} to restart the server`)
      }
    }

    cb && cb()
  })

  // added in order to let vue cli to deal with the http upgrade request
  return {
    apolloServer: server,
    httpServer
  }
}

function load (file) {
  const module = require(file)
  if (module.default) {
    return module.default
  }
  return module
}

function processSchema (typeDefs) {
  if (Array.isArray(typeDefs)) {
    return typeDefs.map(processSchema)
  }

  if (typeof typeDefs === 'string') {
    // Convert schema to AST
    typeDefs = gql(typeDefs)
  }

  // Remove upload scalar (it's already included in Apollo Server)
  removeFromSchema(typeDefs, 'ScalarTypeDefinition', 'Upload')

  return typeDefs
}

function removeFromSchema (document, kind, name) {
  const definitions = document.definitions
  const index = definitions.findIndex(
    def => def.kind === kind && def.name.kind === 'Name' && def.name.value === name
  )
  if (index !== -1) {
    definitions.splice(index, 1)
  }
}
