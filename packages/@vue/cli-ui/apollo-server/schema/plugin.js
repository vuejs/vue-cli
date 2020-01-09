const gql = require('graphql-tag')
// Subs
const channels = require('../channels')
// Connectors
const cwd = require('../connectors/cwd')
const plugins = require('../connectors/plugins')
const dependencies = require('../connectors/dependencies')

exports.types = gql`
extend type Query {
  pluginInstallation: PluginInstallation
  plugins: [Plugin]
  plugin (id: ID!): Plugin
}

extend type Mutation {
  pluginInstall (id: ID!): PluginInstallation
  pluginInstallLocal: PluginInstallation
  pluginUninstall (id: ID!): PluginInstallation
  pluginInvoke (id: ID!): PluginInstallation
  pluginFinishInstall: PluginInstallation
  pluginUpdate (id: ID!, full: Boolean = true): Plugin
  pluginActionCall (id: ID!, params: JSON): PluginActionResult
  pluginsUpdate: [Plugin]
  pluginResetApi: Boolean
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
    version: (plugin, args, context) => dependencies.getVersion(plugin, context),
    description: (plugin, args, context) => dependencies.getDescription(plugin, context),
    logo: (plugin, args, context) => plugins.getLogo(plugin, context)
  },

  Query: {
    pluginInstallation: (root, args, context) => plugins.getInstallation(context),
    plugins: (root, args, context) => plugins.list(cwd.get(), context),
    plugin: (root, { id }, context) => plugins.findOne({ id, file: cwd.get() }, context)
  },

  Mutation: {
    pluginInstall: (root, { id }, context) => plugins.install(id, context),
    pluginInstallLocal: (root, args, context) => plugins.installLocal(context),
    pluginUninstall: (root, { id }, context) => plugins.uninstall(id, context),
    pluginInvoke: (root, { id }, context) => plugins.runInvoke(id, context),
    pluginFinishInstall: (root, args, context) => plugins.finishInstall(context),
    pluginUpdate: (root, { id, full }, context) => plugins.update({ id, full }, context),
    pluginActionCall: (root, args, context) => plugins.callAction(args, context),
    pluginsUpdate: (root, args, context) => plugins.updateAll(context),
    pluginResetApi: (root, args, context) => plugins.resetPluginApi({ file: cwd.get() }, context)
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
