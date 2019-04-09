import gql from 'graphql-tag'

export default gql`
extend type Query {
  connected: Boolean!
  loading: Boolean!
  darkMode: Boolean!
  currentProjectId: String
}

extend type Mutation {
  connectedSet (value: Boolean!): Boolean
  loadingChange (mod: Int!): Boolean
  darkModeSet (enabled: Boolean!): Boolean
  currentProjectIdSet (projectId: String): Boolean
}
`
