module.exports = `
scalar JSON

type ConsoleLog {
  id: ID!
  message: String!
  tag: String
  type: ConsoleLogType!
  date: String
}

enum ConsoleLogType {
  log
  warn
  error
  info
  done
}

enum PackageManager {
  npm
  yarn
}

interface DescribedEntity {
  name: String
  description: String
  link: String
}

type Folder {
  name: String!
  path: String!
  isPackage: Boolean
  isVueProject: Boolean
  favorite: Boolean
  children: [Folder]
}

type Project {
  id: ID!
  name: String!
  path: String!
  favorite: Int
  plugins: [Plugin]
}

input ProjectCreateInput {
  folder: String!
  force: Boolean!
  packageManager: PackageManager
  preset: String!
  remote: Boolean
  clone: Boolean
  save: String
}

input ProjectImportInput {
  path: String!
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

type Version {
  current: String
  latest: String
  wanted: String
  range: String
}

type GitHubStats {
  stars: Int
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

type Feature implements DescribedEntity {
  id: ID!
  name: String
  description: String
  link: String
  enabled: Boolean!
}

enum PromptType {
  input
  confirm
  list
  rawlist
  expand
  checkbox
  password
  editor
}

type PromptChoice {
  value: String!
  name: String
  checked: Boolean
  disabled: Boolean
  isDefault: Boolean
}

type PromptError {
  message: String!
  link: String
}

type Prompt implements DescribedEntity {
  id: ID!
  type: PromptType!
  visible: Boolean!
  enabled: Boolean
  name: String
  message: String
  description: String
  link: String
  choices: [PromptChoice]
  value: String
  valueChanged: Boolean
  error: PromptError
}

input PromptInput {
  id: ID!
  value: String!
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

type Task implements DescribedEntity {
  id: ID!
  status: TaskStatus!
  command: String!
  name: String
  description: String
  link: String
  logs: [TaskLog]
  prompts: [Prompt]
  views: [TaskView]
  defaultView: String
}

enum TaskStatus {
  idle
  running
  done
  error
  terminated
}

type TaskLog {
  taskId: ID!
  type: TaskLogType!
  text: String
}

enum TaskLogType {
  stdout
  stderr
}

type TaskView {
  id: ID!
  label: String!
  component: String!
  icon: String
}

type Configuration implements DescribedEntity {
  id: ID!
  name: String
  description: String
  link: String
  icon: String
  prompts: [Prompt]
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
  consoleLogs: [ConsoleLog]
  consoleLogLast: ConsoleLog
  folderCurrent: Folder
  foldersFavorite: [Folder]
  projects: [Project]
  projectCurrent: Project
  projectCreation: ProjectCreation
  pluginInstallation: PluginInstallation
  plugin (id: ID!): Plugin
  tasks: [Task]
  task (id: ID!): Task
  configurations: [Configuration]
  configuration (id: ID!): Configuration
  fileDiffs: [FileDiff]
  routes: [Route]
  clientAddons: [ClientAddon]
  sharedData (id: ID!): SharedData
}

type Mutation {
  consoleLogsClear: [ConsoleLog]
  folderOpen (path: String!): Folder
  folderOpenParent: Folder
  folderSetFavorite (path: String!, favorite: Boolean!): Folder
  projectCreate (input: ProjectCreateInput!): Project!
  projectImport (input: ProjectImportInput!): Project!
  projectOpen (id: ID!): Project!
  projectSetFavorite (id: ID!, favorite: Int!): Project!
  projectRemove (id: ID!): Boolean!
  projectCwdReset: String
  presetApply (id: ID!): ProjectCreation
  featureSetEnabled (id: ID!, enabled: Boolean): Feature
  promptAnswer (input: PromptInput!): [Prompt]
  pluginInstall (id: ID!): PluginInstallation
  pluginUninstall (id: ID!): PluginInstallation
  pluginInvoke (id: ID!): PluginInstallation
  pluginFinishInstall: PluginInstallation
  pluginUpdate (id: ID!): Plugin
  pluginActionCall (id: ID!, params: JSON): PluginActionResult
  taskRun (id: ID!): Task
  taskStop (id: ID!): Task
  taskLogsClear (id: ID!): Task
  configurationSave (id: ID!): Configuration
  configurationCancel (id: ID!): Configuration
  gitCommit (message: String!): Boolean
  fileOpenInEditor (input: OpenInEditorInput!): Boolean
  sharedDataUpdate (id: ID!, value: JSON!): SharedData
}

type Subscription {
  progressChanged (id: ID!): Progress
  progressRemoved (id: ID!): ID
  consoleLogAdded: ConsoleLog!
  cwdChanged: String!
  taskChanged: Task
  taskLogAdded (id: ID!): TaskLog
  routeAdded: Route
  routeRemoved: Route
  routeChanged: Route
  clientAddonAdded: ClientAddon
  sharedDataUpdated (id: ID!): SharedData
  pluginActionCalled: PluginActionCall
  pluginActionResolved: PluginActionResult
}
`
