const execa = require('execa')
const terminate = require('terminate')

const channels = require('../channels')
const cwd = require('./cwd')
const folders = require('./folders')
const logs = require('./logs')
const plugins = require('./plugins')
const prompts = require('./prompts')

const { getCommand } = require('../utils/command')

const MAX_LOGS = 2000

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

function getPrompts (id, context) {
  const task = findOne(id, context)
  if (task) {
    prompts.reset()
    task.prompts.forEach(prompts.add)
    const data = getSavedData(id, context)
    if (data) {
      prompts.setAnswers(data.answers)
    }
    prompts.start()
    return prompts.list()
  }
}

function updateOne (data, context) {
  const task = findOne(data.id)
  if (task) {
    Object.assign(task, data)
    context.pubsub.publish(channels.TASK_CHANGED, {
      taskChanged: task
    })
  }
  return task
}

function run (id, context) {
  const task = findOne(id, context)
  if (task && task.status !== 'running') {
    const args = ['run', task.name]
    const answers = prompts.getAnswers()

    // Save parameters
    updateSavedData({
      id,
      answers
    }, context)

    // Plugin API
    if (task.onBeforeRun) {
      task.onBeforeRun({
        answers,
        args
      })
    }

    const child = execa(getCommand(), args, {
      cwd: cwd.get(),
      stdio: ['inherit', 'pipe', 'pipe', 'ipc']
    })

    // Plugin API
    if (task.onRun) {
      task.onRun({
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

    const onExit = (code, signal) => {
      // Plugin API
      if (task.onExit) {
        task.onExit({
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
