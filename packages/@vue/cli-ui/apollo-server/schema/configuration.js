const gql = require('graphql-tag')
// Connectors
const cwd = require('../connectors/cwd')
const configurations = require('../connectors/configurations')
const plugins = require('../connectors/plugins')

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
  plugin: Plugin
  tabs: [ConfigurationTab]!
}

type ConfigurationTab {
  id: ID!
  label: String!
  icon: String
  prompts: [Prompt]
}
`

exports.resolvers = {
  Configuration: {
    tabs: (configuration, args, context) => configurations.getPromptTabs(configuration.id, context),
    plugin: (configuration, args, context) => plugins.findOne({ id: configuration.pluginId, file: cwd.get() }, context)
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
