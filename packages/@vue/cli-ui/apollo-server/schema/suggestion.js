const gql = require('graphql-tag')
// Subs
const channels = require('../channels')
// Connectors
const suggestions = require('../connectors/suggestions')

exports.types = gql`
extend type Query {
  suggestions: [Suggestion]
}

extend type Mutation {
  suggestionActivate (input: SuggestionActivate!): Suggestion
}

extend type Subscription {
  suggestionAdded: Suggestion
  suggestionUpdated: Suggestion
  suggestionRemoved: Suggestion
}

type Suggestion {
  id: ID!
  type: SuggestionType!
  importance: SuggestionImportance!
  label: String!
  image: String
  message: String
  link: String
  actionLink: String
  busy: Boolean!
}

enum SuggestionType {
  action
}

enum SuggestionImportance {
  critical
  important
  normal
  secondary
}

input SuggestionActivate {
  id: ID!
}
`

exports.resolvers = {
  Query: {
    suggestions: (root, args, context) => suggestions.list(context)
  },

  Mutation: {
    suggestionActivate: (root, { input }, context) => suggestions.activate(input, context)
  },

  Subscription: {
    suggestionAdded: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.SUGGESTION_ADDED)
    },
    suggestionUpdated: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.SUGGESTION_UPDATED)
    },
    suggestionRemoved: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.SUGGESTION_REMOVED)
    }
  }
}
