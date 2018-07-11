const gql = require('graphql-tag')
// Connectors
const git = require('../connectors/git')

exports.types = gql`
extend type Query {
  fileDiffs: [FileDiff]
}

extend type Mutation {
  gitCommit (message: String!): Boolean
}

type FileDiff {
  id: ID!
  from: String
  to: String
  new: Boolean
  deleted: Boolean
  binary: Boolean
  chunks: [FileDiffChunk]
}

type FileDiffChunk {
  changes: [FileDiffChange]
  oldStart: Int
  oldLines: Int
  newStart: Int
  newLines: Int
}

type FileDiffChange {
  type: FileDiffChangeType
  ln: Int
  ln1: Int
  ln2: Int
  content: String
  normal: Boolean
}

enum FileDiffChangeType {
  normal
  add
  del
}
`

exports.resolvers = {
  Query: {
    fileDiffs: (root, args, context) => git.getDiffs(context)
  },

  Mutation: {
    gitCommit: (root, { message }, context) => git.commit(message, context)
  }
}
