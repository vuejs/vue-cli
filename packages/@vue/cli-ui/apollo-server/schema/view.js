const gql = require('graphql-tag')
// Sub
const channels = require('../channels')
// Connectors
const views = require('../connectors/views')

exports.types = gql`
extend type Query {
  views: [View]
}

extend type Mutation {
  viewOpen (id: ID!): Boolean
}

extend type Subscription {
  viewAdded: View
  viewRemoved: View
  viewChanged: View
}

type View {
  id: ID!
  name: String!
  icon: String!
  tooltip: String
  badges: [ViewBadge]
  projectTypes: [ProjectType]
}

type ViewBadge {
  id: ID!
  type: ViewBadgeType!
  count: Int
  label: String!
  priority: Int!
  hidden: Boolean!
}

enum ViewBadgeType {
  info
  success
  warning
  error
  accent
  dim
}
`

exports.resolvers = {
  Query: {
    views: (root, args, context) => views.list(context)
  },

  Mutation: {
    viewOpen: (root, { id }, context) => views.open(id, context)
  },

  Subscription: {
    viewAdded: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.VIEW_ADDED)
    },
    viewChanged: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.VIEW_CHANGED)
    },
    viewRemoved: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.VIEW_REMOVED)
    }
  }
}
