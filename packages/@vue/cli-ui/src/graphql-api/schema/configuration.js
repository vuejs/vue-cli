const gql = require('graphql-tag')
// Connectors
const configurations = require('../connectors/configurations')

exports.types = gql`
extend type Query {
  configurations: [Configuration]
  configuration (id: ID!): Configuration
}

extend type Mutation {
  configurationSave (id: ID!): Configuration
  configurationCancel (id: ID!): Configuration
}

type Configuration implements DescribedEntity {
  id: ID!
  name: String!
  description: String
  link: String
  icon: String
  prompts: [Prompt]
}
`

exports.resolvers = {
  Configuration: {
    prompts: (configuration, args, context) => configurations.getPrompts(configuration.id, context)
  },

  Query: {
    configurations: (root, args, context) => configurations.list(context),
    configuration: (root, { id }, context) => configurations.findOne(id, context)
  },

  Mutation: {
    configurationSave: (root, { id }, context) => configurations.save(id, context),
    configurationCancel: (root, { id }, context) => configurations.cancel(id, context)
  }
}
