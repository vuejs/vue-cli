const gql = require('graphql-tag')
// Subs
const { withFilter } = require('graphql-subscriptions')
const channels = require('../channels')
// Connectors
const tasks = require('../connectors/tasks')
const plugins = require('../connectors/plugins')

exports.types = gql`
extend type Query {
  tasks: [Task]
  task (id: ID!): Task
}

extend type Mutation {
  taskRun (id: ID!): Task
  taskStop (id: ID!): Task
  taskLogsClear (id: ID!): Task
  taskOpen (id: ID!): Boolean
}

extend type Subscription {
  taskChanged: Task
  taskLogAdded (id: ID!): TaskLog
}

type Task implements DescribedEntity {
  id: ID!
  status: TaskStatus!
  command: String!
  name: String
  description: String
  link: String
  icon: String
  logs: [TaskLog]
  prompts: [Prompt]
  views: [TaskView]
  defaultView: String
  plugin: Plugin
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
`

exports.resolvers = {
  Task: {
    prompts: (task, args, context) => tasks.getPrompts(task.id, context),
    plugin: (task, args, context) => plugins.findOne(task.pluginId, context)
  },

  Query: {
    tasks: (root, args, context) => tasks.list(context),
    task: (root, { id }, context) => tasks.findOne(id, context)
  },

  Mutation: {
    taskRun: (root, { id }, context) => tasks.run(id, context),
    taskStop: (root, { id }, context) => tasks.stop(id, context),
    taskLogsClear: (root, { id }, context) => tasks.clearLogs(id, context),
    taskOpen: (root, { id }, context) => tasks.open(id, context)
  },

  Subscription: {
    taskChanged: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator(channels.TASK_CHANGED)
    },
    taskLogAdded: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator(channels.TASK_LOG_ADDED),
        (payload, vars) => payload.taskLogAdded.taskId === vars.id
      )
    }
  }
}
