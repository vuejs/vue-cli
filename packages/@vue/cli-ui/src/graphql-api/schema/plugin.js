const gql = require('graphql-tag')
// Subs
const channels = require('../channels')
// Connectors
const plugins = require('../connectors/plugins')

exports.types = gql`
extend type Query {
  pluginInstallation: PluginInstallation
  plugin (id: ID!): Plugin
}

extend type Mutation {
  pluginInstall (id: ID!): PluginInstallation
  pluginUninstall (id: ID!): PluginInstallation
  pluginInvoke (id: ID!): PluginInstallation
  pluginFinishInstall: PluginInstallation
  pluginUpdate (id: ID!): Plugin
  pluginActionCall (id: ID!, params: JSON): PluginActionResult
}

extend type Subscription {
  pluginActionCalled: PluginActionCall
  pluginActionResolved: PluginActionResult
}

type Plugin {
  id: ID!
  version: Version!
  official: Boolean
  installed: Boolean
  website: String
  description: String
  githubStats: GitHubStats
  logo: String
}

type PluginInstallation {
  id: ID!
  pluginId: ID
  step: PluginInstallationStep
  prompts: [Prompt]
}

enum PluginInstallationStep {
  install
  uninstall
  config
  diff
}

type PluginActionCall {
  id: ID!
  params: JSON
}

type PluginActionResult {
  id: ID!
  params: JSON
  results: [JSON]
  errors: [JSON]
}
`

exports.resolvers = {
  Plugin: {
    version: (plugin, args, context) => plugins.getVersion(plugin, context),
    description: (plugin, args, context) => plugins.getDescription(plugin, context),
    logo: (plugin, args, context) => plugins.getLogo(plugin, context)
  },

  Query: {
    pluginInstallation: (root, args, context) => plugins.getInstallation(context),
    plugin: (root, { id }, context) => plugins.findOne(id, context)
  },

  Mutation: {
    pluginInstall: (root, { id }, context) => plugins.install(id, context),
    pluginUninstall: (root, { id }, context) => plugins.uninstall(id, context),
    pluginInvoke: (root, { id }, context) => plugins.runInvoke(id, context),
    pluginFinishInstall: (root, args, context) => plugins.finishInstall(context),
    pluginUpdate: (root, { id }, context) => plugins.update(id, context),
    pluginActionCall: (root, args, context) => plugins.callAction(args, context)
  },

  Subscription: {
    pluginActionCalled: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.PLUGIN_ACTION_CALLED)
    },
    pluginActionResolved: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.PLUGIN_ACTION_RESOLVED)
    }
  }
}
