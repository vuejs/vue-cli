const gql = require('graphql-tag')
// Connectors
const projects = require('../connectors/projects')
const plugins = require('../connectors/plugins')
const tasks = require('../connectors/tasks')

exports.types = gql`
extend type Query {
  projects: [Project]
  projectCurrent: Project
  projectCreation: ProjectCreation
}

extend type Mutation {
  projectInitCreation: ProjectCreation
  projectCancelCreation: Boolean
  projectCreate (input: ProjectCreateInput!): Project!
  projectImport (input: ProjectImportInput!): Project!
  projectOpen (id: ID!): Project!
  projectRemove (id: ID!): Boolean!
  projectCwdReset: String
  projectSetFavorite (id: ID!, favorite: Int!): Project!
  presetApply (id: ID!): ProjectCreation
  featureSetEnabled (id: ID!, enabled: Boolean): Feature
}

type Project {
  id: ID!
  name: String!
  type: ProjectType
  path: String!
  favorite: Int
  plugins: [Plugin]
  tasks: [Task]
  homepage: String
  openDate: JSON
}

enum ProjectType {
  vue
  unknown
}

input ProjectCreateInput {
  folder: String!
  force: Boolean!
  bare: Boolean!
  packageManager: PackageManager
  preset: String!
  remote: String
  clone: Boolean
  save: String
  enableGit: Boolean!
  gitCommitMessage: String
}

input ProjectImportInput {
  path: String!
  force: Boolean
}

type Preset implements DescribedEntity {
  id: ID!
  name: String
  description: String
  link: String
  features: [String]
}

type ProjectCreation {
  presets: [Preset]
  features: [Feature]
  prompts: [Prompt]
}

type Feature implements DescribedEntity {
  id: ID!
  name: String
  description: String
  link: String
  enabled: Boolean!
}
`

exports.resolvers = {
  Project: {
    type: (project, args, context) => projects.getType(project, context),
    plugins: (project, args, context) => plugins.list(project.path, context),
    tasks: (project, args, context) => tasks.list({ file: project.path }, context),
    homepage: (project, args, context) => projects.getHomepage(project, context)
  },

  Query: {
    projects: (root, args, context) => projects.list(context),
    projectCurrent: (root, args, context) => projects.getCurrent(context),
    projectCreation: (root, args, context) => projects.getCreation(context)
  },

  Mutation: {
    projectInitCreation: (root, args, context) => projects.initCreator(context),
    projectCancelCreation: (root, args, context) => projects.removeCreator(context),
    projectCreate: (root, { input }, context) => projects.create(input, context),
    projectImport: (root, { input }, context) => projects.import(input, context),
    projectOpen: (root, { id }, context) => projects.open(id, context),
    projectRemove: (root, { id }, context) => projects.remove(id, context),
    projectCwdReset: (root, args, context) => projects.resetCwd(context),
    projectSetFavorite: (root, args, context) => projects.setFavorite(args, context),
    presetApply: (root, { id }, context) => projects.applyPreset(id, context),
    featureSetEnabled: (root, args, context) => projects.setFeatureEnabled(args, context)
  }
}
