const gql = require('graphql-tag')
const path = require('path')
const globby = require('globby')

const typeDefs = [gql`
scalar JSON

enum PackageManager {
  npm
  yarn
}

interface DescribedEntity {
  name: String
  description: String
  link: String
}

type Version {
  current: String
  latest: String
  wanted: String
  range: String
}

type GitHubStats {
  stars: Int
}

type Progress {
  id: ID!
  status: String
  info: String
  error: String
  # Progress from 0 to 1 (-1 means disabled)
  progress: Float
  args: [String]
}

input OpenInEditorInput {
  file: String!
  line: Int
  column: Int
  gitPath: Boolean
}

type Route {
  id: ID!
  name: String!
  icon: String!
  tooltip: String
}

type ClientAddon {
  id: ID!
  url: String!
}

type SharedData {
  id: ID!
  value: JSON
}

type Query {
  progress (id: ID!): Progress
  cwd: String!
  routes: [Route]
  clientAddons: [ClientAddon]
  sharedData (id: ID!): SharedData
}

type Mutation {
  fileOpenInEditor (input: OpenInEditorInput!): Boolean
  sharedDataUpdate (id: ID!, value: JSON!): SharedData
}

type Subscription {
  progressChanged (id: ID!): Progress
  progressRemoved (id: ID!): ID
  cwdChanged: String!
  routeAdded: Route
  routeRemoved: Route
  routeChanged: Route
  clientAddonAdded: ClientAddon
  sharedDataUpdated (id: ID!): SharedData
}
`]

// Load types in './schema'
const paths = globby.sync([path.join(__dirname, './schema/*.js')])
paths.forEach(file => {
  const { types } = require(file)
  types && typeDefs.push(types)
})

module.exports = typeDefs
