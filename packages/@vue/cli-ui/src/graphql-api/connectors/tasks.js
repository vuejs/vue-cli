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
const views = require('./views')
// Utils
const { getCommand } = require('../utils/command')
const { log } = require('../utils/logger')

const MAX_LOGS = 2000
const VIEW_ID = 'vue-project-tasks'

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
        const moreData = plugins.getApi().getDescribedTask(command)
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
    ).concat(plugins.getApi().addedTasks.map(
      task => {
        const id = `${file}:${task.name}`
        existing.set(id, true)
        return {
          id,
          index: list.findIndex(t => t.id === id),
          prompts: [],
          views: [],
          fullCommand: true,
          ...task
        }
      }
    ))

    // Process existing tasks
    const existingTasks = currentTasks.filter(
      task => task.index !== -1
    )
    // Update tasks data
    existingTasks.forEach(task => {
      Object.assign(list[task.index], task)
    })

    // Process removed tasks
    const removedTasks = list.filter(
      t => currentTasks.findIndex(c => c.id === t.id) === -1
    )
    // Remove badges
    removedTasks.forEach(task => {
      updateViewBadges({ task }, context)
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
      updateViewBadges({
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

function updateViewBadges ({ task, data }, context) {
  const viewId = VIEW_ID

  // New badges
  if (data) {
    if (data.status === 'error') {
      views.addBadge({
        viewId,
        badge: {
          id: 'vue-task-error',
          type: 'error',
          label: 'components.view-badge.labels.tasks.error',
          priority: 3
        }
      }, context)
    } else if (data.status === 'running') {
      views.addBadge({
        viewId,
        badge: {
          id: 'vue-task-running',
          type: 'info',
          label: 'components.view-badge.labels.tasks.running',
          priority: 2
        }
      }, context)
    } else if (data.status === 'done') {
      views.addBadge({
        viewId,
        badge: {
          id: 'vue-task-done',
          type: 'success',
          label: 'components.view-badge.labels.tasks.done',
          priority: 1,
          hidden: true
        }
      }, context)
    }
  }

  // Remove previous badges
  if (task.status === 'error') {
    views.removeBadge({ viewId, badgeId: 'vue-task-error' }, context)
  } else if (task.status === 'running') {
    views.removeBadge({ viewId, badgeId: 'vue-task-running' }, context)
  } else if (task.status === 'done') {
    views.removeBadge({ viewId, badgeId: 'vue-task-done' }, context)
  }
}

async function run (id, context) {
  const task = findOne(id, context)
  if (task && task.status !== 'running') {
    task._terminating = false

    // Answers
    const answers = prompts.getAnswers()
    let args = task.fullCommand ? [] : ['run', task.name]
    let command = task.fullCommand ? task.command : getCommand()

    // Process command containing args
    if (command.indexOf(' ')) {
      const parts = command.split(' ')
      command = parts.shift()
      args = [...parts, ...args]
    }

    // Output colors
    // See: https://www.npmjs.com/package/supports-color
    process.env.FORCE_COLOR = 1

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

    log('Task run', command, args)

    updateOne({
      id: task.id,
      status: 'running'
    }, context)
    logs.add({
      message: `Task ${task.id} started`,
      type: 'info'
    }, context)

    if (task.fullCommand) {
      addLog({
        taskId: task.id,
        type: 'stdout',
        text: `$ ${command} ${args.join(' ')}`
      }, context)
    }

    process.env.VUE_CLI_CONTEXT = cwd.get()

    const child = execa(command, args, {
      cwd: cwd.get(),
      stdio: ['inherit', 'pipe', 'pipe']
    })

    task.child = child

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
      log('Task exit', command, args, 'code:', code, 'signal:', signal)

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

      if (code === null || task._terminating) {
        updateOne({
          id: task.id,
          status: 'terminated'
        }, context)
        logs.add({
          message: `Task ${task.id} was terminated`,
          type: 'info'
        }, context)
      } else if (code !== 0) {
        updateOne({
          id: task.id,
          status: 'error'
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
          status: 'done'
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

    // Plugin API
    if (task.onRun) {
      await task.onRun({
        args,
        child,
        cwd: cwd.get()
      })
    }
  }
  return task
}

function stop (id, context) {
  const task = findOne(id, context)
  if (task && task.status === 'running' && task.child) {
    task._terminating = true
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
