const channels = require('./channels')
const cwd = require('./connectors/cwd')
const folders = require('./connectors/folders')
const projects = require('./connectors/projects')

module.exports = {
  Folder: {
    children: (folder, args, context) => folders.list(folder.path, context)
  },

  Query: {
    cwd: () => cwd.get(),
    folderCurrent: (root, args, context) => folders.getCurrent(args, context),
    projects: (root, args, context) => projects.list(context),
    projectCurrent: (root, args, context) => projects.getCurrent(context)
  },

  Mutation: {
    folderOpen: (root, { path }, context) => folders.open(path, context),
    folderOpenParent: (root, args, context) => folders.openParent(cwd.get(), context)
  },

  Subscription: {
    cwdChanged: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.CWD_CHANGED)
    }
  }
}
