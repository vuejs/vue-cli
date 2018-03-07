const exit = require('@vue/cli-shared-utils/lib/exit')
const channels = require('./channels')
const cwd = require('./connectors/cwd')
const folders = require('./connectors/folders')
const projects = require('./connectors/projects')

// Prevent code from exiting server process
exit.exitProcess = false

module.exports = {
  Folder: {
    children: (folder, args, context) => folders.list(folder.path, context),
    isPackage: (folder, args, context) => folders.isPackage(folder.path, context),
    isVueProject: (folder, args, context) => folders.isVueProject(folder.path, context)
  },

  Project: {
    plugins: (project, args, context) => projects.getPlugins(project.id, context)
  },

  Query: {
    cwd: () => cwd.get(),
    folderCurrent: (root, args, context) => folders.getCurrent(args, context),
    foldersFavorite: (root, args, context) => folders.listFavorite(context),
    projects: (root, args, context) => projects.list(context),
    projectCurrent: (root, args, context) => projects.getCurrent(context),
    projectCreation: (root, args, context) => projects.getCreation(context)
  },

  Mutation: {
    folderOpen: (root, { path }, context) => folders.open(path, context),
    folderOpenParent: (root, args, context) => folders.openParent(cwd.get(), context),
    folderSetFavorite: (root, args, context) => folders.setFavorite({
      file: args.path,
      favorite: args.favorite
    }, context),
    presetApply: (root, { id }, context) => projects.applyPreset(id, context),
    featureSetEnabled: (root, args, context) => projects.setFeatureEnabled(args, context),
    promptAnswer: (root, { input }, context) => projects.answerPrompt(input, context),
    projectCreate: (root, { input }, context) => projects.create(input, context),
    projectImport: (root, { input }, context) => projects.import(input, context),
    projectOpen: (root, { id }, context) => projects.open(id, context),
    projectRemove: (root, { id }, context) => projects.remove(id, context)
  },

  Subscription: {
    cwdChanged: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.CWD_CHANGED)
    },
    createStatus: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.CREATE_STATUS)
    }
  }
}
