const gql = require('graphql-tag')
// Connectors
const folders = require('../connectors/folders')
const cwd = require('../connectors/cwd')

exports.types = gql`
extend type Query {
  folderCurrent: Folder
  foldersFavorite: [Folder]
  folderExists (file: String!): Boolean
}

extend type Mutation {
  folderOpen (path: String!): Folder
  folderOpenParent: Folder
  folderSetFavorite (path: String!, favorite: Boolean!): Folder
  folderCreate(name: String!): Folder
}

type Folder {
  name: String!
  path: String!
  isPackage: Boolean
  isVueProject: Boolean
  favorite: Boolean
  children: [Folder]
  hidden: Boolean
}
`

exports.resolvers = {
  Folder: {
    children: (folder, args, context) => folders.list(folder.path, context),
    isPackage: (folder, args, context) => folders.isPackage(folder.path, context),
    isVueProject: (folder, args, context) => folders.isVueProject(folder.path, context),
    favorite: (folder, args, context) => folders.isFavorite(folder.path, context)
  },

  Query: {
    folderCurrent: (root, args, context) => folders.getCurrent(args, context),
    foldersFavorite: (root, args, context) => folders.listFavorite(context),
    folderExists: (root, { file }, context) => folders.isDirectory(file)
  },

  Mutation: {
    folderOpen: (root, { path }, context) => folders.open(path, context),
    folderOpenParent: (root, args, context) => folders.openParent(cwd.get(), context),
    folderSetFavorite: (root, args, context) => folders.setFavorite({
      file: args.path,
      favorite: args.favorite
    }, context),
    folderCreate: (root, { name }, context) => folders.create(name, context)
  }
}
