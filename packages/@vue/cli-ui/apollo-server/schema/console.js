const gql = require('graphql-tag')
// Subs
const channels = require('../channels')
// Connectors
const logs = require('../connectors/logs')

exports.types = gql`
extend type Query {
  consoleLogs: [ConsoleLog]
  consoleLogLast: ConsoleLog
}

extend type Mutation {
  consoleLogsClear: [ConsoleLog]
}

extend type Subscription {
  consoleLogAdded: ConsoleLog!
}

type ConsoleLog {
  id: ID!
  message: String!
  tag: String
  type: ConsoleLogType!
  date: String
}

enum ConsoleLogType {
  log
  warn
  error
  info
  done
}
`

exports.resolvers = {
  Query: {
    consoleLogs: (root, args, context) => logs.list(context),
    consoleLogLast: (root, args, context) => logs.last(context)
  },

  Mutation: {
    consoleLogsClear: (root, args, context) => logs.clear(context)
  },

  Subscription: {
    consoleLogAdded: {
      subscribe: (parent, args, context) => context.pubsub.asyncIterator(channels.CONSOLE_LOG_ADDED)
    }
  }
}
