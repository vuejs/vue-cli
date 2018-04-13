const gql = require('graphql-tag')
// Sub
const channels = require('../channels')
// Connectors
const routes = require('../connectors/routes')

exports.types = gql`
extend type Query {
  routes: [Route]
  vueRouterDefinitions: [VueRouterDefinition]
}

extend type Subscription {
  routeAdded: Route
  routeRemoved: Route
  routeChanged: Route
  vueRouterDefinitionAdded: VueRouterDefinition
  vueRouterDefinitionRemoved: VueRouterDefinition
}

type Route {
  id: ID!
  name: String!
  icon: String!
  tooltip: String
  badges: [RouteBadge]
}

type RouteBadge {
  id: ID!
  type: RouteBadgeType!
  count: Int
  label: String!
  priority: Int!
  hidden: Boolean!
}

enum RouteBadgeType {
  info
  success
  warning
  error
  accent
  dim
}

type VueRouterDefinition {
  id: ID!
  routes: JSON
}
`

exports.resolvers = {
  Query: {
    routes: (root, args, context) => routes.list(context),
    vueRouterDefinitions: (root, args, context) => routes.listVueRouterDefinitions(context)
  },

  Subscription: {
    routeAdded: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.ROUTE_ADDED)
    },
    routeChanged: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.ROUTE_CHANGED)
    },
    routeRemoved: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.ROUTE_REMOVED)
    },
    vueRouterDefinitionAdded: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.VUE_ROUTER_DEFINITION_ADDED)
    },
    vueRouterDefinitionRemoved: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.VUE_ROUTER_DEFINITION_REMOVED)
    }
  }
}
