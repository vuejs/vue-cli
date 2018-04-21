const path = require('path')
const execa = require('execa')
const terminate = require('terminate')
const notifier = require('node-notifier')
// Subs
const channels = require('../channels')
// Connectors
const cwd = require('./cwd')
const folders = require('./folders')
const logs = require('./logs')
const plugins = require('./plugins')
const prompts = require('./prompts')
const routes = require('./routes')

const { getCommand } = require('../utils/command')

const MAX_LOGS = 2000
const ROUTE_ID = 'vue-project-tasks'

const tasks = new Map()

function getTasks () {
  const file = cwd.get()
  let list = tasks.get(file)
  if (!list) {
    list = []
    tasks.set(file, list)
  }
  return list
}

function list (context) {
  let list = getTasks()
  const file = cwd.get()
  const pkg = folders.readPackage(file, context)
  if (pkg.scripts) {
    const existing = new Map()

    // Get current valid tasks in project `package.json`
    const currentTasks = Object.keys(pkg.scripts).map(
      name => {
        const id = `${file}:${name}`
        existing.set(id, true)
        const command = pkg.scripts[name]
        const moreData = plugins.getApi().getTask(command)
        return {
          id,
          name,
          command,
          index: list.findIndex(t => t.id === id),
          prompts: [],
          views: [],
          ...moreData
        }
      }
    )

    // Process existing tasks
    const existingTasks = currentTasks.filter(
      task => task.index !== -1
    )
    // Update tasks data
    existingTasks.forEach(task => {
      Object.assign(list[task.index], task)
    })

    // Process removed tasks
    const removedTasks = currentTasks.filter(
      task => task.index === -1
    )
    // Remove badges
    removedTasks.forEach(task => {
      updateRouteBadges({ task }, context)
    })

    // Process new tasks
    const newTasks = currentTasks.filter(
      task => task.index === -1
    ).map(
      task => ({
        ...task,
        status: 'idle',
        child: null,
        logs: []
      })
    )

    // Keep existing or ran tasks
    list = list.filter(
      task => existing.get(task.id) ||
      task.status !== 'idle'
    )

    // Add the new tasks
    list = list.concat(newTasks)

    tasks.set(file, list)
  }
  return list
}

function findOne (id, context) {
  return getTasks().find(
    t => t.id === id
  )
}

function getSavedData (id, context) {
  return context.db.get('tasks').find({
    id
  }).value()
}

function updateSavedData (data, context) {
  if (getSavedData(data.id, context)) {
    context.db.get('tasks').find({ id: data.id }).assign(data).write()
  } else {
    context.db.get('tasks').push(data).write()
  }
}

async function getPrompts (id, context) {
  const task = findOne(id, context)
  if (task) {
    await prompts.reset()
    task.prompts.forEach(prompts.add)
    const data = getSavedData(id, context)
    if (data) {
      await prompts.setAnswers(data.answers)
    }
    await prompts.start()
    return prompts.list()
  }
}

function updateOne (data, context) {
  const task = findOne(data.id)
  if (task) {
    if (task.status !== data.status) {
      updateRouteBadges({
        task,
        data
      }, context)
    }

    Object.assign(task, data)
    context.pubsub.publish(channels.TASK_CHANGED, {
      taskChanged: task
    })
  }
  return task
}

function updateRouteBadges ({ task, data }, context) {
  const routeId = ROUTE_ID

  // New badges
  if (data) {
    if (data.status === 'error') {
      routes.addBadge({
        routeId,
        badge: {
          id: 'vue-task-error',
          type: 'error',
          label: 'components.route-badge.labels.tasks.error',
          priority: 3
        }
      }, context)
    } else if (data.status === 'running') {
      routes.addBadge({
        routeId,
        badge: {
          id: 'vue-task-running',
          type: 'info',
          label: 'components.route-badge.labels.tasks.running',
          priority: 2
        }
      }, context)
    } else if (data.status === 'done') {
      routes.addBadge({
        routeId,
        badge: {
          id: 'vue-task-done',
          type: 'success',
          label: 'components.route-badge.labels.tasks.done',
          priority: 1,
          hidden: true
        }
      }, context)
    }
  }

  // Remove previous badges
  if (task.status === 'error') {
    routes.removeBadge({ routeId, badgeId: 'vue-task-error' }, context)
  } else if (task.status === 'running') {
    routes.removeBadge({ routeId, badgeId: 'vue-task-running' }, context)
  } else if (task.status === 'done') {
    routes.removeBadge({ routeId, badgeId: 'vue-task-done' }, context)
  }
}

async function run (id, context) {
  const task = findOne(id, context)
  if (task && task.status !== 'running') {
    const args = ['run', task.name]
    const answers = prompts.getAnswers()
    const command = getCommand()

    // Save parameters
    updateSavedData({
      id,
      answers
    }, context)

    // Plugin API
    if (task.onBeforeRun) {
      await task.onBeforeRun({
        answers,
        args
      })
    }

    if (command === 'npm') {
      args.splice(0, 0, '--')
    }

    const child = execa(command, args, {
      cwd: cwd.get(),
      stdio: ['inherit', 'pipe', 'pipe', 'ipc']
    })

    // Plugin API
    if (task.onRun) {
      await task.onRun({
        args,
        child,
        cwd: cwd.get()
      })
    }

    updateOne({
      id: task.id,
      status: 'running',
      child
    }, context)
    logs.add({
      message: `Task ${task.id} started`,
      type: 'info'
    }, context)

    child.stdout.on('data', buffer => {
      addLog({
        taskId: task.id,
        type: 'stdout',
        text: buffer.toString()
      }, context)
    })

    child.stderr.on('data', buffer => {
      addLog({
        taskId: task.id,
        type: 'stderr',
        text: buffer.toString()
      }, context)
    })

    const onExit = async (code, signal) => {
      // Plugin API
      if (task.onExit) {
        await task.onExit({
          args,
          child,
          cwd: cwd.get(),
          code,
          signal
        })
      }

      if (code === null) {
        updateOne({
          id: task.id,
          status: 'terminated',
          child: null
        }, context)
        logs.add({
          message: `Task ${task.id} was terminated`,
          type: 'warn'
        }, context)
      } else if (code !== 0) {
        updateOne({
          id: task.id,
          status: 'error',
          child: null
        }, context)
        logs.add({
          message: `Task ${task.id} ended with error code ${code}`,
          type: 'error'
        }, context)
        notifier.notify({
          title: `Task error`,
          message: `Task ${task.id} ended with error code ${code}`,
          icon: path.resolve(__dirname, '../../assets/error.png')
        })
      } else {
        updateOne({
          id: task.id,
          status: 'done',
          child: null
        }, context)
        logs.add({
          message: `Task ${task.id} completed`,
          type: 'done'
        }, context)
        notifier.notify({
          title: `Task completed`,
          message: `Task ${task.id} completed`,
          icon: path.resolve(__dirname, '../../assets/done.png')
        })
      }
    }

    child.on('exit', onExit)
  }
  return task
}

function stop (id, context) {
  const task = findOne(id, context)
  if (task && task.status === 'running') {
    terminate(task.child.pid)
  }
  return task
}

function addLog (log, context) {
  const task = findOne(log.taskId, context)
  if (task) {
    if (task.logs.length === MAX_LOGS) {
      task.logs.shift()
    }
    task.logs.push(log)
    context.pubsub.publish(channels.TASK_LOG_ADDED, {
      taskLogAdded: log
    })
  }
}

function clearLogs (id, context) {
  const task = findOne(id, context)
  if (task) {
    task.logs = []
  }
  return task
}

module.exports = {
  list,
  findOne,
  getPrompts,
  run,
  stop,
  updateOne,
  clearLogs
}
