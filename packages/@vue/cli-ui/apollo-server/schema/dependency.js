const gql = require('graphql-tag')
// Connectors
const cwd = require('../connectors/cwd')
const dependencies = require('../connectors/dependencies')

exports.types = gql`
extend type Query {
  dependencies: [Dependency]
  dependency (id: ID!): Dependency
}

extend type Mutation {
  dependencyInstall (input: DependencyInstall!): Dependency
  dependencyUninstall (input: DependencyUninstall!): Dependency
  dependencyUpdate (input: DependencyUpdate!): Dependency
  dependenciesUpdate: [Dependency]
}

type Dependency {
  id: ID!
  type: DependencyType!
  version: Version!
  installed: Boolean
  website: String
  description: String
  githubStats: GitHubStats
}

enum DependencyType {
  dependencies
  devDependencies
}

input DependencyInstall {
  id: ID!
  type: DependencyType!
  range: String
}

input DependencyUninstall {
  id: ID!
}

input DependencyUpdate {
  id: ID!
}
`

exports.resolvers = {
  Dependency: {
    version: (dependency, args, context) => dependencies.getVersion(dependency, context),
    description: (dependency, args, context) => dependencies.getDescription(dependency, context)
  },

  Query: {
    dependencies: (root, args, context) => dependencies.list(cwd.get(), context),
    dependency: (root, { id }, context) => dependencies.findOne(id, context)
  },

  Mutation: {
    dependencyInstall: (root, { input }, context) => dependencies.install(input, context),
    dependencyUninstall: (root, { input }, context) => dependencies.uninstall(input, context),
    dependencyUpdate: (root, { input }, context) => dependencies.update(input, context),
    dependenciesUpdate: (root, args, context) => dependencies.updateAll(context)
  }
}
